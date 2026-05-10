import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { IconSource } from '../atoms/Icon'
import SandIcon, { useReducedMotion } from '../atoms/SandIcon'

/**
 * Two-column tile for the celestial zodiac picker. Visual shape mirrors
 * PlanetTile: a glyph silhouette in the left slot, primary + secondary
 * text on the right, per-element tint driving the gradient frame, border,
 * glow, and primary text. Difference: the slot hosts a SandIcon (drifting
 * particles + wind tail) rendered in the element's tint, instead of a
 * WebGL planet canvas.
 *
 * Reduced motion: renders the static unicode glyph in the slot — no
 * canvas, no wind.
 */

export type ZodiacElement = 'fire' | 'water' | 'air' | 'earth'

interface ZodiacTileBaseProps {
  /**
   * Sand-rasterizable source for the zodiac glyph. Pass
   * e.g. `Icon.Aries.source` from the Icon library.
   */
  source: IconSource
  element: ZodiacElement
  primary: ReactNode
  secondary?: ReactNode
  className?: string
  'aria-label'?: string
}

interface ZodiacTileLinkProps extends ZodiacTileBaseProps {
  to: string
  onClick?: undefined
}

interface ZodiacTileButtonProps extends ZodiacTileBaseProps {
  onClick: () => void
  to?: undefined
}

export type ZodiacTileProps = ZodiacTileLinkProps | ZodiacTileButtonProps

// Element tints in 8-bit RGB. Picked to align with the existing badge
// palette in SignsView (red/blue/yellow/green-300 family) and to
// read as text on dark surfaces.
const ELEMENT_TINT: Record<ZodiacElement, [number, number, number]> = {
  fire: [248, 113, 113],   // red-400
  water: [96, 165, 250],   // blue-400
  air: [250, 204, 21],     // yellow-400
  earth: [74, 222, 128],   // green-400
}

// Slot geometry mirrors PlanetTile. The SandIcon canvas, however, spans
// the entire card (same trick InfoTile uses) so the wind tail can drift
// across the full width before the mask fades it. The body silhouette
// is centered at the slot's visual center inside that wider canvas.
//
// Slot center math: card has p-5 (20px) padding, slot has -ml-2 (8px
// pull-in), slot width 180 → center at 20 - 8 + 90 = 102px from the
// card's left border-box edge.
const SLOT_PX = 180
const SAND_BODY_SIZE = 160
const SAND_BODY_OFFSET_X = 102
const SAND_MASK_GRADIENT = 'linear-gradient(to right, black 220px, transparent 100%)'

export default function ZodiacTile(props: ZodiacTileProps) {
  const { source, element, primary, secondary, className } = props
  const reducedMotion = useReducedMotion()
  const sandActive = !reducedMotion

  const [tr, tg, tb] = ELEMENT_TINT[element]
  const tintRgb = `${tr}, ${tg}, ${tb}`
  const tintCss = `rgb(${tintRgb})`

  // Static fallback used when reduced motion is on. Pulled directly
  // from the icon source so the tile and the SandIcon never disagree.
  // Glyph sources render the codepoint in a span (font-symbol routes
  // through a font that has the codepoint); SVG sources render an
  // inline <svg> in the same neutral stroke style the rasterizer
  // uses (fill="none" stroke="currentColor" stroke-width="1.5").
  const fallback: ReactNode =
    source.kind === 'glyph' ? (
      <span className="text-9xl opacity-80 font-symbol">{source.glyph}</span>
    ) : (
      <svg
        viewBox={source.viewBox}
        width="70%"
        height="70%"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
        aria-hidden="true"
      >
        {source.children}
      </svg>
    )

  const frame = 'card bg-black flex items-center gap-4 group overflow-hidden relative'
  const focus =
    'focus-visible:ring-celestial-400 hover:transform-none active:scale-[0.98] motion-reduce:transition-none'
  const cls = `${frame} ${focus}${className ? ` ${className}` : ''}`

  const baseShadow =
    'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 10px 28px -6px rgba(0,0,0,0.7)'
  const engagedGlow = `0 0 15px rgba(${tintRgb}, 0.18), 0 0 45px rgba(${tintRgb}, 0.06)`
  // Resting border + drop shadow live on the frame element. The engaged
  // border + glow are layered via an overlay below whose opacity reacts
  // to the parent .group's hover/focus-visible — same group selector
  // that crossfades the gradient layers, so transitions stay coherent.
  const frameStyle: React.CSSProperties = {
    borderColor: `rgba(${tintRgb}, 0.20)`,
    boxShadow: baseShadow,
  }

  // Two stacked gradient layers crossfade between resting (fainter,
  // tighter sweep) and engaged (brighter, wider sweep) via opacity, the
  // only reliable way to animate a gradient stop change.
  const restingGradient = `linear-gradient(to bottom right, rgba(${tintRgb}, 0.20), transparent 33%)`
  const engagedGradient = `linear-gradient(to bottom right, rgba(${tintRgb}, 0.30), transparent 45%)`
  const gradientLayers = (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 ease-out-expo motion-reduce:transition-none group-hover:opacity-0 group-focus-visible:opacity-0"
        style={{ backgroundImage: restingGradient }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 ease-out-expo motion-reduce:transition-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ backgroundImage: engagedGradient }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-2xl border opacity-0 transition-opacity duration-300 ease-out-expo motion-reduce:transition-none group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          borderColor: `rgba(${tintRgb}, 0.40)`,
          boxShadow: engagedGlow,
        }}
      />
    </>
  )

  // SandIcon canvas spans the entire card. The wrapper inherits the
  // element tint as text-color, which SandIcon's controller picks up
  // via getComputedStyle. text-9xl matches the static fallback's
  // font-size so the sand silhouette and the reduced-motion glyph
  // paint at the same scale. The symbol-rich font-family is set on
  // the SandIcon canvas itself (font-symbol) and on every GlyphIcon,
  // so the wrapper doesn't need to carry it. The mask fades the
  // trailing wind before the text column.
  const sandLayer = sandActive && (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none text-9xl"
      style={{
        color: tintCss,
        maskImage: SAND_MASK_GRADIENT,
        WebkitMaskImage: SAND_MASK_GRADIENT,
      }}
    >
      <SandIcon
        source={source}
        bodySize={SAND_BODY_SIZE}
        bodyOffsetX={SAND_BODY_OFFSET_X}
      />
    </div>
  )

  // Spacer reserves the planet-sized slot in flex layout so the text
  // column starts past it. When sand is off, this slot also hosts the
  // static fallback glyph; the GlyphIcon component carries
  // font-symbol so the codepoint resolves without help from us.
  const slotSpacer = (
    <div
      aria-hidden="true"
      className="shrink-0 -ml-2"
      style={{ width: SLOT_PX, height: SLOT_PX }}
    >
      {!sandActive && (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ color: tintCss }}
        >
          {fallback}
        </div>
      )}
    </div>
  )

  const text = (
    <div className="relative z-10 flex flex-col min-w-0">
      <div
        className="text-2xl font-system font-semibold tracking-tight"
        style={{ color: tintCss }}
      >
        {primary}
      </div>
      {secondary !== undefined && (
        <div className="text-xs text-white leading-relaxed mt-0.5">
          {secondary}
        </div>
      )}
    </div>
  )

  if (props.to !== undefined) {
    return (
      <Link
        to={props.to}
        className={cls}
        style={frameStyle}
        aria-label={props['aria-label']}
      >
        {gradientLayers}
        {sandLayer}
        {slotSpacer}
        {text}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`${cls} appearance-none text-left w-full`}
      style={frameStyle}
      aria-label={props['aria-label']}
    >
      {gradientLayers}
      {sandLayer}
      {slotSpacer}
      {text}
    </button>
  )
}
