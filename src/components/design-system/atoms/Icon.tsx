import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Icon library for the 14 HEC design system.
 *
 * Icons are named after the glyph itself, not the role it happens to play
 * in the app. A "Body" tile composes `Icon.Ankh` or `Icon.Shamrock` — the
 * library does not decide. New names follow the unicode form: ☘ is
 * `Shamrock`, ⚛ is `Atom`, ☉ is `Sun`.
 *
 * Two render strategies share the same prop surface:
 *   GlyphIcon — wraps a unicode codepoint in a span. Color and size flow
 *     from the parent's text color and font-size.
 *   SvgIcon — wraps inline SVG sized in `em` and stroked in `currentColor`.
 *     Same color/size inheritance contract as GlyphIcon.
 *
 * Canonical sizes: 16 / 20 / 24. Default inherits the parent's font-size.
 * Pass `size` for fixed pixels or use Tailwind text-* on a parent.
 *
 * Accessibility: decorative by default. The wrapper carries `aria-hidden`
 * and the SVG glyph has no accessible name, so screen readers skip it.
 * When the icon carries meaning on its own (no adjacent text label), pass
 * `label` — the wrapper becomes `role="img"` with that aria-label, and
 * unicode glyph names like "white heart suit" are no longer leaked.
 *
 * Source descriptor: every icon exposes `Icon.X.source`, a tagged union
 * describing how to rasterize the icon outside React (used by SandIcon
 * and any other consumer that needs the raw graphic). Glyph icons carry
 * `{ kind: 'glyph', glyph }`; SVG icons carry `{ kind: 'svg', viewBox,
 * children }`. When the library moves fully to SVG, the glyph branch
 * disappears without changing the public API.
 */

export interface IconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'aria-hidden' | 'aria-label' | 'role'> {
  /** Pixel size override. Omit to inherit the parent's font-size. */
  size?: number
  /**
   * Accessible name. When set, the icon announces as an image with this
   * label. When omitted (default), the icon is hidden from assistive tech.
   * Do not pass when the icon sits next to a visible text label that
   * already names it — that would cause a duplicate announcement.
   */
  label?: string
}

export type IconSource =
  | { kind: 'glyph'; glyph: string }
  | { kind: 'svg'; viewBox: string; children: ReactNode }

export type IconComponent = ((props: IconProps) => JSX.Element) & {
  displayName: string
  source: IconSource
}

interface GlyphIconProps extends IconProps {
  glyph: string
}

function GlyphIcon({ size, glyph, style, label, className, ...rest }: GlyphIconProps) {
  const sizeStyle = size !== undefined ? { fontSize: size } : null
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }
  // font-symbol routes through a stack that has the unicode codepoints
  // these glyphs use (Inter and the body sans-serif fallback don't).
  // The class can be overridden by a caller-supplied className if needed.
  const cls = `font-symbol${className ? ` ${className}` : ''}`
  return (
    <span
      className={cls}
      style={{ lineHeight: 1, ...sizeStyle, ...style }}
      {...rest}
      {...a11y}
    >
      {glyph}
    </span>
  )
}

interface SvgIconProps extends IconProps {
  children: ReactNode
  viewBox?: string
}

function SvgIcon({ size, style, children, viewBox = '0 0 24 24', label, ...rest }: SvgIconProps) {
  const sizeStyle = size !== undefined ? { fontSize: size } : null
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }
  return (
    <span
      style={{ lineHeight: 1, display: 'inline-flex', ...sizeStyle, ...style }}
      {...rest}
      {...a11y}
    >
      <svg
        width="1em"
        height="1em"
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </span>
  )
}

// Factories: each icon is one line, and gets `displayName` + `source` for
// free. Keeps the catalog scannable and guarantees every icon has a
// rasterizable source.

/**
 * Build a unicode-codepoint icon. Children render as a `<span>` whose
 * font-size flows from the parent. The wrapper carries `font-symbol`
 * so codepoints outside Inter (zodiac signs ♈–♓, alchemical symbols,
 * etc.) resolve without the caller needing to set a font-family chain.
 * Exported so adjacent atoms can produce the same `IconComponent` shape.
 */
export function glyphIcon(name: string, glyph: string): IconComponent {
  const Comp: IconComponent = Object.assign(
    (p: IconProps) => <GlyphIcon glyph={glyph} {...p} />,
    {
      displayName: `Icon.${name}`,
      source: { kind: 'glyph' as const, glyph },
    },
  )
  return Comp
}

/**
 * Build a stroke-style SVG icon. Children are wrapped by `<SvgIcon>` and
 * by the SandIcon rasterizer's neutral `<g fill="none" stroke="currentColor"
 * stroke-width="1.5">` group, so paths inherit stroke styling — author
 * children as `<path d=… />`, `<circle … />`, etc., without setting their
 * own fill/stroke attributes. Exported so adjacent atoms (e.g.
 * `ZodiacSymbol`) can produce the same `IconComponent` shape.
 */
export function svgIcon(
  name: string,
  viewBox: string,
  children: ReactNode,
): IconComponent {
  const Comp: IconComponent = Object.assign(
    (p: IconProps) => <SvgIcon viewBox={viewBox} {...p}>{children}</SvgIcon>,
    {
      displayName: `Icon.${name}`,
      source: { kind: 'svg' as const, viewBox, children },
    },
  )
  return Comp
}

// ─── Botanical / domain ─────────────────────────────────────────────────

const Shamrock = glyphIcon('Shamrock', '☘')
const Aesculapius = glyphIcon('Aesculapius', '⚕')
const Heart = glyphIcon('Heart', '♡')
const HeartExclamation = glyphIcon('HeartExclamation', '❣')
const Atom = glyphIcon('Atom', '⚛')
const Ankh = glyphIcon('Ankh', '☥')

// SVG — no satisfactory monochrome unicode glyph for a lotus. Stylized
// 3-petal lotus on a water line.
const lotusChildren = (
  <>
    <path d="M4 19 H20" opacity={0.5} />
    <path d="M12 19 C8 16 5 11 4 7 C8 8 11 13 12 19 Z" />
    <path d="M12 19 C16 16 19 11 20 7 C16 8 13 13 12 19 Z" />
    <path d="M12 19 C11 14 11 8 12 4 C13 8 13 14 12 19 Z" />
  </>
)
const Lotus = svgIcon('Lotus', '0 0 24 24', lotusChildren)

// ─── Celestial bodies ───────────────────────────────────────────────────

const Sun = glyphIcon('Sun', '☉')
const Moon = glyphIcon('Moon', '☽')
const Mercury = glyphIcon('Mercury', '☿')
const Venus = glyphIcon('Venus', '♀')
const Mars = glyphIcon('Mars', '♂')
const Jupiter = glyphIcon('Jupiter', '♃')
const Saturn = glyphIcon('Saturn', '♄')
const Uranus = glyphIcon('Uranus', '♅')
const Neptune = glyphIcon('Neptune', '♆')
const Pluto = glyphIcon('Pluto', '♇')
const Comet = glyphIcon('Comet', '☄')

// Zodiac signs live in their own atom (`ZodiacSymbol`) so consumers
// have a single place to opt into the symbol-rich font-family chain
// these codepoints (♈–♓) require. Import from
// `@/components/design-system/atoms/ZodiacSymbol`.

// ─── Stars / decorative ─────────────────────────────────────────────────

const Star = glyphIcon('Star', '★')
const StarFourPoint = glyphIcon('StarFourPoint', '✦')
const StarFourPointOutline = glyphIcon('StarFourPointOutline', '✧')
const StarSixPoint = glyphIcon('StarSixPoint', '✶')
const StarEightPoint = glyphIcon('StarEightPoint', '✴')
const StarPinwheel = glyphIcon('StarPinwheel', '✵')
const Sparkles = glyphIcon('Sparkles', '✨')
const Snowflake = glyphIcon('Snowflake', '❄')
const Florette = glyphIcon('Florette', '❀')
const FloretteOutlined = glyphIcon('FloretteOutlined', '❁')

// ─── Emblems / objects ──────────────────────────────────────────────────

const House = glyphIcon('House', '⌂')
const Scales = glyphIcon('Scales', '⚖')
const Alembic = glyphIcon('Alembic', '⚗')
const Hexagon = glyphIcon('Hexagon', '⬢')
const Hourglass = glyphIcon('Hourglass', '⧖')
const SquareInSquare = glyphIcon('SquareInSquare', '▣')
const DharmaWheel = glyphIcon('DharmaWheel', '☸')
const Watch = glyphIcon('Watch', '⌚')
const Pencil = glyphIcon('Pencil', '✎')

// Aliased on export to avoid shadowing the JS global within this module.
const InfinitySymbol = glyphIcon('Infinity', '∞')

// ─── Status / control ───────────────────────────────────────────────────

const Warning = glyphIcon('Warning', '⚠')
const NoEntry = glyphIcon('NoEntry', '⛔')
const Check = glyphIcon('Check', '✓')
const MultiplicationX = glyphIcon('MultiplicationX', '✕')
const BallotX = glyphIcon('BallotX', '✘')
const Circle = glyphIcon('Circle', '○')
const Fisheye = glyphIcon('Fisheye', '◉')
const CircledBullet = glyphIcon('CircledBullet', '⦿')
const TriangleRight = glyphIcon('TriangleRight', '▶')

// ─── Arrows ─────────────────────────────────────────────────────────────

const ArrowLeft = glyphIcon('ArrowLeft', '←')
const ArrowRight = glyphIcon('ArrowRight', '→')
const ArrowUp = glyphIcon('ArrowUp', '↑')

export const Icon = {
  // botanical / domain
  Shamrock,
  Aesculapius,
  Heart,
  HeartExclamation,
  Atom,
  Ankh,
  Lotus,
  // celestial bodies
  Sun,
  Moon,
  Mercury,
  Venus,
  Mars,
  Jupiter,
  Saturn,
  Uranus,
  Neptune,
  Pluto,
  Comet,
  // stars / decorative
  Star,
  StarFourPoint,
  StarFourPointOutline,
  StarSixPoint,
  StarEightPoint,
  StarPinwheel,
  Sparkles,
  Snowflake,
  Florette,
  FloretteOutlined,
  // emblems / objects
  House,
  Scales,
  Alembic,
  Hexagon,
  Hourglass,
  SquareInSquare,
  DharmaWheel,
  Watch,
  Pencil,
  Infinity: InfinitySymbol,
  // status / control
  Warning,
  NoEntry,
  Check,
  MultiplicationX,
  BallotX,
  Circle,
  Fisheye,
  CircledBullet,
  TriangleRight,
  // arrows
  ArrowLeft,
  ArrowRight,
  ArrowUp,
}
