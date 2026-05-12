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
 * Flat, edge-to-edge list row carrying a live planet visual. Same engaged
 * treatment as `FlatListRow` (left-edge tint bar + black-to-transparent
 * left wash + tinted inset glow that fade in on hover/select), sized
 * taller so the planet has room to read. The icon column is a WebGL
 * canvas hosting the spike's `PlanetCluster` plus a `WindDrift` field
 * that lifts grains off the planet and drifts them past the text — same
 * role the sand tail plays in `FlatListRow`.
 *
 * On hover/focus the planet morphs into its astrological glyph; wind
 * grains follow the silhouette through the morph.
 *
 * Each row owns its own Canvas (and therefore its own WebGL context).
 * Browsers cap simultaneous contexts around 16, so very long lists of
 * planets will need a shared-overlay-canvas approach instead.
 *
 * Reduced motion: renders the static unicode glyph in the slot — no
 * canvas, no wind.
 */

// Square slot reserved for the planet on the left. Sized for a list-row
// context — larger than `FlatListRow`'s 64px icon slot so the planet
// reads as a real body, smaller than `PlanetTile`'s 180px so several
// rows fit comfortably in a sidebar.
const SLOT_PX = 120
// Padding inside the slot so rings (Saturn) don't kiss the edge.
const FIT_PADDING = 0.08
// CSS x of the planet's visual center, measured from the row's left
// border. Row has px-6 (24px) padding, slot is 120px wide → center at
// 24 + 60 = 84.
const PLANET_CENTER_X = 84
// Wind grains additive-blend on the dark row, so they brighten anything
// they drift over. Mask keeps the planet area opaque and fades the wind
// tail to transparent before reaching the text. Start fade just past the
// slot's right edge (24 + 120 = 144) and finish before typical secondary-
// text columns get crowded.
const WIND_MASK_GRADIENT = 'linear-gradient(to right, black 160px, transparent 280px)'

// Outer extent of the planet in world units, including the ring if any.
function visualExtent(config: PlanetVisual): number {
  const ring = config.ring
  return ring ? ring.outer * config.bodyScale : config.bodyScale
}

// Smallest planet (Pluto, height 40) renders at this fraction of the
// largest (Sun, height 200). Higher value = subtler differentiation.
const SCALE_MIN = 0.7
const HEIGHT_MIN = 40
const HEIGHT_MAX = 200

// Linear map from spike-config height into [SCALE_MIN, 1.0] so smaller
// planets read smaller in their row slots. Per-planet `tileScale`
// overrides the formula entirely.
function planetScale(config: PlanetVisual): number {
  if (config.tileScale !== undefined) return config.tileScale
  const t = (config.height - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN)
  const clamped = Math.max(0, Math.min(1, t))
  return SCALE_MIN + (1 - SCALE_MIN) * clamped
}

// Per-row zoom (CSS px per world unit) that fits the planet into the
// slot, then scales it down by `planetScale` so smaller planets read
// smaller in their rows.
function rowZoom(config: PlanetVisual): number {
  const fitZoom = SLOT_PX / 2 / (visualExtent(config) * (1 + FIT_PADDING))
  return fitZoom * planetScale(config)
}

// Spike's vertical viewport extent (see spike/PlanetField.tsx). Used to
// reconstruct each planet's native body diameter from `config.height`,
// since the spike maps height → world units via the same constant.
const SPIKE_VVE = 8 * Math.tan(Math.PI / 12)

// Multiplier on top of native-density preservation. 1.0 keeps each
// planet at roughly the same particles-per-pixel ratio it had in the
// spike.
const ROW_PARTICLE_DENSITY = 1.0

// Reach is roughly speed × lifespan. Splitting the stretch between the
// two lets the wind drift further than the spike defaults without
// speeding up the per-frame motion.
const ROW_WIND_SPEED_SCALE = 1.0
const ROW_WIND_LIFESPAN_SCALE = 2.2

function rowBodyAreaRatio(config: PlanetVisual, zoom: number): number {
  const r = (zoom * SPIKE_VVE) / config.height
  return r * r
}

function withRowDensity(config: PlanetVisual, zoom: number): PlanetVisual {
  const ratio = rowBodyAreaRatio(config, zoom) * ROW_PARTICLE_DENSITY
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
  // CSS px from the canvas's left edge.
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
        speedScale={ROW_WIND_SPEED_SCALE}
        lifespanScale={ROW_WIND_LIFESPAN_SCALE}
      />
    </>
  )
}

export interface PlanetFlatListRowProps {
  /** Internal SPA route. Renders as `<Link>` so middle-click / cmd-click work. */
  to: string
  config: PlanetVisual
  /** Primary line — kept earth-100 for legibility regardless of tint. */
  primary: ReactNode
  /** Secondary line — earth-400. Optional. */
  secondary?: ReactNode
  /**
   * Locks the row in its engaged appearance (stronger inner glow, the
   * left-edge accent bar, and the planet morphed into its glyph). Use
   * to mark the active list item in a list/detail layout.
   */
  selected?: boolean
  'aria-label'?: string
}

export default function PlanetFlatListRow({
  to,
  config,
  primary,
  secondary,
  selected,
  'aria-label': ariaLabel,
}: PlanetFlatListRowProps) {
  const [hovered, setHovered] = useState(false)
  const engaged = !!selected || hovered
  const reducedMotion = useReducedMotion()
  const morphRef = useRef(0) as MorphRef
  const bodyRef = useRef<THREE.Points | null>(null) as PointsRef
  const ringRef = useRef<THREE.Points | null>(null) as PointsRef

  const zoom = rowZoom(config)
  // Memoize the density-adjusted config — PlanetCluster's particle
  // buffers are useMemo'd against the config reference, so a fresh
  // object every render would tear down and rebuild them every frame.
  const rowConfig = useMemo(() => withRowDensity(config, zoom), [config, zoom])

  const [tr, tg, tb] = config.tint
  const tintRgb = `${tr}, ${tg}, ${tb}`
  const tintCss = `rgb(${tintRgb})`

  // Single soft directional inset glow on the left edge, tinted by the
  // planet. Matches `FlatListRow`'s engaged shadow exactly, just sourced
  // from the planet's rgb tint instead of a hex prop.
  const engagedShadow = `inset 32px 0 16px -16px rgba(${tintRgb}, 0.25)`
  // Black-to-transparent wash beneath the glow — darkens the left side
  // so the tinted glow pops.
  const washGradient = 'linear-gradient(to right, black, transparent)'
  // Hover reveals just the bar at low opacity — clean cursor hint, no
  // glow or wash. Selected layers in the full engaged treatment.
  const glowOpacity = selected ? 1 : 0
  const barOpacity = selected ? 1 : hovered ? 0.55 : 0

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative isolate flex items-center gap-4 px-6 py-4 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:[outline-offset:-2px]"
    >
      {/* Selected-only left-edge glow + black wash. Hover doesn't engage
          this — keeps the hover hint to just the bar. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          backgroundImage: washGradient,
          boxShadow: engagedShadow,
          opacity: glowOpacity,
        }}
      />
      {/* Left-edge tint bar — fades in on hover (subtle) and selected (full). */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] z-20 transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          background: tintCss,
          opacity: barOpacity,
        }}
      />

      {/* Live planet canvas. Mask fades the wind tail before it reaches
          the text column; planet area itself stays fully opaque. */}
      {!reducedMotion && (
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
              config={rowConfig}
              engaged={engaged}
              morphRef={morphRef}
              bodyRef={bodyRef}
              ringRef={ringRef}
            />
          </Canvas>
        </div>
      )}

      {/* Spacer reserves the planet's visual slot in flex layout so the
          text column starts past it. Hosts the static glyph fallback
          when reduced motion is on. */}
      <div
        aria-hidden="true"
        className="shrink-0"
        style={{ width: SLOT_PX, height: SLOT_PX }}
      >
        {reducedMotion && (
          <div
            className="w-full h-full flex items-center justify-center text-7xl opacity-80"
            style={{ color: tintCss }}
          >
            {config.glyph}
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col min-w-0">
        <Type.Subheading as="div" style={{ color: tintCss }}>
          {primary}
        </Type.Subheading>
        {secondary !== undefined && (
          <Type.Caption as="div" className="mt-1">
            {secondary}
          </Type.Caption>
        )}
      </div>
    </Link>
  )
}
