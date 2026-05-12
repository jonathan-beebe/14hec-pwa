import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual } from '@/components/spike/planetConfig'
import PlanetCluster, {
  MORPH_LAMBDA,
  type MorphRef,
  type PointsRef,
} from '@/components/spike/PlanetCluster'
import WindDrift from '@/components/spike/WindDrift'
import Type from '../atoms/Type'
import { useReducedMotion } from '../atoms/useReducedMotion'

/**
 * Two-column tile for the celestial planet picker. Shape mirrors InfoTile:
 * a body silhouette in the left slot, primary + secondary text on the
 * right. Difference: a single WebGL canvas spans the whole tile and hosts
 * the spike's PlanetCluster (in the left slot) plus a WindDrift field
 * sourced from that planet, so grains lift off the planet and drift past
 * the text — same role the SandIcon wind tail plays in InfoTile.
 *
 * On hover/focus, the planet morphs into its astrological glyph; wind
 * grains follow the silhouette through the morph.
 *
 * Each tile owns its own Canvas (and therefore its own WebGL context).
 * Browsers cap simultaneous contexts around 16, so dense layouts of many
 * tiles will need a shared-overlay-canvas approach instead.
 *
 * Reduced motion: renders the static unicode glyph in the slot — no
 * canvas, no wind.
 */

const SLOT_PX = 180
// Padding inside the slot so rings (Saturn) don't kiss the edge.
const FIT_PADDING = 0.08
// CSS x of the planet's visual center, measured from the card's left
// border. Matches the slot's flex placement: card p-5 (20px) + half of
// slot − ml-2 pull-in (8px) → 20 + 90 − 8 = 102.
const PLANET_CENTER_X = 102
// Wind grains additive-blend on the dark card, so they brighten anything
// they drift over. This mask fades them to transparent before reaching
// the text — same idea as InfoTile's SAND_MASK_GRADIENT. Start fade just
// past the slot's right edge (PLANET_CENTER_X + SLOT_PX/2 ≈ 192).
const WIND_MASK_GRADIENT = 'linear-gradient(to right, black 220px, transparent 100%)'

export interface PlanetTileProps {
  /** Internal SPA route. Renders as `<Link>` so middle-click / cmd-click work. */
  to: string
  config: PlanetVisual
  primary: ReactNode
  secondary?: ReactNode
  className?: string
  'aria-label'?: string
  /**
   * Lock the tile in its engaged appearance — the cluster morphs into
   * the planetary glyph, the gradient brightens, and the border + glow
   * lift to the engaged tint. Use to mark the active list item in a
   * list/detail layout.
   */
  selected?: boolean
}

// Outer extent of the planet in world units, including the ring if any.
function visualExtent(config: PlanetVisual): number {
  const ring = config.ring
  return ring ? ring.outer * config.bodyScale : config.bodyScale
}

// Per-tile zoom (CSS px per world unit) that fits the planet into the
// slot, then scales it down by `planetScale` so smaller planets read
// smaller in their tiles. The slot itself stays SLOT_PX; smaller planets
// just get more whitespace around them.
function tileZoom(config: PlanetVisual): number {
  const fitZoom = SLOT_PX / 2 / (visualExtent(config) * (1 + FIT_PADDING))
  return fitZoom * planetScale(config)
}

// Smallest planet (Pluto, height 40) renders at this fraction of the
// largest (Sun, height 200). Higher value = subtler differentiation.
const SCALE_MIN = 0.7
const HEIGHT_MIN = 40
const HEIGHT_MAX = 200

// Linear map from spike-config height (which already encodes the
// designer's intended relative sizes) into [SCALE_MIN, 1.0]. Compresses
// the natural ~5× range into a gentler ratio that still telegraphs
// "Sun > Jupiter > Mars > Pluto" at a glance. Per-planet `tileScale`
// overrides the formula entirely — useful when the auto-scale undersells
// a planet (Saturn's ring, satellites, etc).
function planetScale(config: PlanetVisual): number {
  if (config.tileScale !== undefined) return config.tileScale
  const t = (config.height - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN)
  const clamped = Math.max(0, Math.min(1, t))
  return SCALE_MIN + (1 - SCALE_MIN) * clamped
}

// Spike's vertical viewport extent (see spike/PlanetField.tsx). Used to
// reconstruct each planet's native body diameter from `config.height`,
// since the spike maps height → world units via the same constant.
const SPIKE_VVE = 8 * Math.tan(Math.PI / 12)

// Multiplier on top of native-density preservation. 1.0 keeps each
// planet at roughly the same particles-per-pixel ratio it had in the
// spike. Bump above 1.0 to make every tile denser; drop below to thin.
const TILE_PARTICLE_DENSITY = 1.0

// Reach is roughly speed × lifespan. Splitting the stretch between the
// two lets the wind drift further than the spike defaults without
// speeding up the per-frame motion — grains move at ~spike pace and
// just live long enough to reach the right side of the tile.
const TILE_WIND_SPEED_SCALE = 1.0
const TILE_WIND_LIFESPAN_SCALE = 2.2

// Ratio of tile body area to spike body area. Multiplying particle
// counts by this preserves spike density at tile scale: small planets
// like Pluto blow up ~10× in area in the tile (since the tile renders
// every planet at near-slot size) and would look sparse without a
// matching boost.
function tileBodyAreaRatio(config: PlanetVisual, zoom: number): number {
  // native body diameter (px) = 2 * bodyScale * config.height / SPIKE_VVE
  // tile body diameter (px) = 2 * bodyScale * zoom
  // ratio of (tile / native) is the part below; squared for area.
  const r = (zoom * SPIKE_VVE) / config.height
  return r * r
}

// Body and ring particles share the same area-ratio multiplier. The
// ring annulus scales with the body in world units, so its tile-vs-
// native area ratio works out identically — same multiplier applies.
function withTileDensity(config: PlanetVisual, zoom: number): PlanetVisual {
  const ratio = tileBodyAreaRatio(config, zoom) * TILE_PARTICLE_DENSITY
  return {
    ...config,
    particleCount: Math.max(1, Math.round(config.particleCount * ratio)),
    ring: config.ring
      ? {
          ...config.ring,
          particleCount: Math.max(
            1,
            Math.round(config.ring.particleCount * ratio),
          ),
        }
      : undefined,
  }
}

function PlanetScene({
  config,
  engaged,
  morphRef,
  bodyRef,
  ringRef,
}: {
  config: PlanetVisual
  engaged: boolean
  morphRef: MorphRef
  bodyRef: PointsRef
  ringRef: PointsRef
}) {
  // The Canvas owns its own ortho camera (centered on world origin). We
  // translate the planet group so its visual center sits at PLANET_CENTER_X
  // CSS px from the canvas's left edge. World x of that target =
  // (target_css_x - canvas_center_css_x) / zoom.
  const { size, camera } = useThree()
  const ortho = camera as THREE.OrthographicCamera
  const zoom = ortho.zoom || 1
  const worldX = (PLANET_CENTER_X - size.width / 2) / zoom

  useFrame((_, delta) => {
    morphRef.current = THREE.MathUtils.damp(
      morphRef.current,
      engaged ? 1 : 0,
      MORPH_LAMBDA,
      delta,
    )
  })

  return (
    <>
      <group position={[worldX, 0, 0]}>
        <PlanetCluster
          config={config}
          morphRef={morphRef}
          bodyRef={bodyRef}
          ringRef={ringRef}
        />
      </group>
      <WindDrift
        sources={[{ config, morphRef, bodyRef, ringRef }]}
        speedScale={TILE_WIND_SPEED_SCALE}
        lifespanScale={TILE_WIND_LIFESPAN_SCALE}
      />
    </>
  )
}

export default function PlanetTile({
  to,
  config,
  primary,
  secondary,
  className,
  selected,
  'aria-label': ariaLabel,
}: PlanetTileProps) {
  const [hoverEngaged, setHoverEngaged] = useState(false)
  // Selected locks the tile in its engaged appearance; hover/focus still
  // toggle the same state for non-selected tiles, so behavior is unchanged
  // when the prop is omitted.
  const engaged = selected || hoverEngaged
  const reducedMotion = useReducedMotion()
  const morphRef = useRef(0) as MorphRef
  const bodyRef = useRef<THREE.Points | null>(null) as PointsRef
  const ringRef = useRef<THREE.Points | null>(null) as PointsRef

  const zoom = tileZoom(config)
  // Memoize the density-adjusted config — PlanetCluster's particle
  // buffers are useMemo'd against the config reference, so a fresh
  // object every render would tear down and rebuild them every frame.
  const tileConfig = useMemo(() => withTileDensity(config, zoom), [config, zoom])

  // Per-planet tint drives the gradient frame, border, glow, and primary
  // text — same role celestial-{300,400,500} plays for the rest of the
  // design system, but data-driven so each planet wears its own color.
  const [tr, tg, tb] = config.tint
  const tintRgb = `${tr}, ${tg}, ${tb}`
  const tintCss = `rgb(${tintRgb})`

  // Frame is `.card` (glass base + transition) + bg-black to neutralize
  // the glass tint, plus inline styles for the per-planet treatment.
  // overflow-hidden clips the canvas to the rounded corners.
  const frame = 'card bg-black flex items-center gap-4 group overflow-hidden relative'
  const focus =
    'focus-visible:ring-celestial-400 hover:transform-none active:scale-[0.98] motion-reduce:transition-none'
  const cls = `${frame} ${focus}${className ? ` ${className}` : ''}`

  // Inline frame style mirrors InfoTile's tone treatment: tint border
  // and a paired glow on engagement (same 15px/45px pair as
  // `boxShadow.glow-*` in tailwind.config). At rest the glow drops out,
  // leaving the deeper resting drop shadow + inset highlight. The
  // gradient lives in stacked overlay divs (below) so it can crossfade
  // smoothly via opacity — gradients themselves don't reliably
  // interpolate when their stops change.
  const baseShadow =
    'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 10px 28px -6px rgba(0,0,0,0.7)'
  const engagedGlow =
    `, 0 0 15px rgba(${tintRgb}, 0.18), 0 0 45px rgba(${tintRgb}, 0.06)`
  const frameStyle: React.CSSProperties = {
    borderColor: `rgba(${tintRgb}, ${engaged ? 0.40 : 0.20})`,
    boxShadow: baseShadow + (engaged ? engagedGlow : ''),
  }

  // Two stacked gradient layers crossfade between resting (fainter, tighter
  // sweep) and engaged (brighter, wider sweep) via opacity transitions —
  // the only reliable way to animate a gradient stop change.
  const restingGradient = `linear-gradient(to bottom right, rgba(${tintRgb}, 0.20), transparent 33%)`
  const engagedGradient = `linear-gradient(to bottom right, rgba(${tintRgb}, 0.30), transparent 45%)`
  const gradientLayers = (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 ease-out-expo"
        style={{ backgroundImage: restingGradient, opacity: engaged ? 0 : 1 }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 ease-out-expo"
        style={{ backgroundImage: engagedGradient, opacity: engaged ? 1 : 0 }}
      />
    </>
  )

  // Live canvas spans the whole tile. Mask fades the wind tail before it
  // reaches the text; planet area is fully opaque.
  const canvasLayer = !reducedMotion && (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        maskImage: WIND_MASK_GRADIENT,
        WebkitMaskImage: WIND_MASK_GRADIENT,
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <PlanetScene
          config={tileConfig}
          engaged={engaged}
          morphRef={morphRef}
          bodyRef={bodyRef}
          ringRef={ringRef}
        />
      </Canvas>
    </div>
  )

  // Spacer reserves the planet's visual slot in flex layout so the text
  // column starts past it. Width matches the static glyph's box (w-24
  // − ml-2 in InfoTile = 88px effective, rounded to SLOT_PX here).
  const slotSpacer = (
    <div
      aria-hidden="true"
      className="shrink-0 -ml-2"
      style={{ width: SLOT_PX, height: SLOT_PX }}
    >
      {reducedMotion && (
        <div
          className="w-full h-full flex items-center justify-center text-9xl opacity-80"
          style={{ color: tintCss }}
        >
          {config.glyph}
        </div>
      )}
    </div>
  )

  const text = (
    <div className="relative z-10 flex flex-col min-w-0">
      <Type.Heading as="div" style={{ color: tintCss }}>
        {primary}
      </Type.Heading>
      {secondary !== undefined && (
        <Type.Caption as="div" className="mt-0.5">
          {secondary}
        </Type.Caption>
      )}
    </div>
  )

  // Hover and focus both drive engagement so keyboard users get the same
  // morph reveal as mouse users.
  const handlers = {
    onMouseEnter: () => setHoverEngaged(true),
    onMouseLeave: () => setHoverEngaged(false),
    onFocus: () => setHoverEngaged(true),
    onBlur: () => setHoverEngaged(false),
  }

  return (
    <Link
      to={to}
      className={cls}
      style={frameStyle}
      aria-label={ariaLabel}
      {...handlers}
    >
      {gradientLayers}
      {canvasLayer}
      {slotSpacer}
      {text}
    </Link>
  )
}
