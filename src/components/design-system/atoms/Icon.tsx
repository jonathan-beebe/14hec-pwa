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

interface GlyphIconProps extends IconProps {
  glyph: string
}

function GlyphIcon({ size, glyph, style, label, ...rest }: GlyphIconProps) {
  const sizeStyle = size !== undefined ? { fontSize: size } : null
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }
  return (
    <span
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

// ─── Botanical / domain ─────────────────────────────────────────────────

const Shamrock = (p: IconProps) => <GlyphIcon glyph="☘" {...p} />
Shamrock.displayName = 'Icon.Shamrock'

const Aesculapius = (p: IconProps) => <GlyphIcon glyph="⚕" {...p} />
Aesculapius.displayName = 'Icon.Aesculapius'

const Heart = (p: IconProps) => <GlyphIcon glyph="♡" {...p} />
Heart.displayName = 'Icon.Heart'

const HeartExclamation = (p: IconProps) => <GlyphIcon glyph="❣" {...p} />
HeartExclamation.displayName = 'Icon.HeartExclamation'

const Atom = (p: IconProps) => <GlyphIcon glyph="⚛" {...p} />
Atom.displayName = 'Icon.Atom'

const Ankh = (p: IconProps) => <GlyphIcon glyph="☥" {...p} />
Ankh.displayName = 'Icon.Ankh'

// SVG — no satisfactory monochrome unicode glyph for a lotus. Stylized
// 3-petal lotus on a water line.
const Lotus = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M4 19 H20" opacity={0.5} />
    <path d="M12 19 C8 16 5 11 4 7 C8 8 11 13 12 19 Z" />
    <path d="M12 19 C16 16 19 11 20 7 C16 8 13 13 12 19 Z" />
    <path d="M12 19 C11 14 11 8 12 4 C13 8 13 14 12 19 Z" />
  </SvgIcon>
)
Lotus.displayName = 'Icon.Lotus'

// ─── Celestial bodies ───────────────────────────────────────────────────

const Sun = (p: IconProps) => <GlyphIcon glyph="☉" {...p} />
Sun.displayName = 'Icon.Sun'

const Moon = (p: IconProps) => <GlyphIcon glyph="☽" {...p} />
Moon.displayName = 'Icon.Moon'

const Mercury = (p: IconProps) => <GlyphIcon glyph="☿" {...p} />
Mercury.displayName = 'Icon.Mercury'

const Venus = (p: IconProps) => <GlyphIcon glyph="♀" {...p} />
Venus.displayName = 'Icon.Venus'

const Mars = (p: IconProps) => <GlyphIcon glyph="♂" {...p} />
Mars.displayName = 'Icon.Mars'

const Jupiter = (p: IconProps) => <GlyphIcon glyph="♃" {...p} />
Jupiter.displayName = 'Icon.Jupiter'

const Saturn = (p: IconProps) => <GlyphIcon glyph="♄" {...p} />
Saturn.displayName = 'Icon.Saturn'

const Uranus = (p: IconProps) => <GlyphIcon glyph="♅" {...p} />
Uranus.displayName = 'Icon.Uranus'

const Neptune = (p: IconProps) => <GlyphIcon glyph="♆" {...p} />
Neptune.displayName = 'Icon.Neptune'

const Pluto = (p: IconProps) => <GlyphIcon glyph="♇" {...p} />
Pluto.displayName = 'Icon.Pluto'

const Comet = (p: IconProps) => <GlyphIcon glyph="☄" {...p} />
Comet.displayName = 'Icon.Comet'

// ─── Stars / decorative ─────────────────────────────────────────────────

const Star = (p: IconProps) => <GlyphIcon glyph="★" {...p} />
Star.displayName = 'Icon.Star'

const StarFourPoint = (p: IconProps) => <GlyphIcon glyph="✦" {...p} />
StarFourPoint.displayName = 'Icon.StarFourPoint'

const StarFourPointOutline = (p: IconProps) => <GlyphIcon glyph="✧" {...p} />
StarFourPointOutline.displayName = 'Icon.StarFourPointOutline'

const StarSixPoint = (p: IconProps) => <GlyphIcon glyph="✶" {...p} />
StarSixPoint.displayName = 'Icon.StarSixPoint'

const StarEightPoint = (p: IconProps) => <GlyphIcon glyph="✴" {...p} />
StarEightPoint.displayName = 'Icon.StarEightPoint'

const StarPinwheel = (p: IconProps) => <GlyphIcon glyph="✵" {...p} />
StarPinwheel.displayName = 'Icon.StarPinwheel'

const Sparkles = (p: IconProps) => <GlyphIcon glyph="✨" {...p} />
Sparkles.displayName = 'Icon.Sparkles'

const Snowflake = (p: IconProps) => <GlyphIcon glyph="❄" {...p} />
Snowflake.displayName = 'Icon.Snowflake'

const Florette = (p: IconProps) => <GlyphIcon glyph="❀" {...p} />
Florette.displayName = 'Icon.Florette'

const FloretteOutlined = (p: IconProps) => <GlyphIcon glyph="❁" {...p} />
FloretteOutlined.displayName = 'Icon.FloretteOutlined'

// ─── Emblems / objects ──────────────────────────────────────────────────

const House = (p: IconProps) => <GlyphIcon glyph="⌂" {...p} />
House.displayName = 'Icon.House'

const Scales = (p: IconProps) => <GlyphIcon glyph="⚖" {...p} />
Scales.displayName = 'Icon.Scales'

const Alembic = (p: IconProps) => <GlyphIcon glyph="⚗" {...p} />
Alembic.displayName = 'Icon.Alembic'

const Hexagon = (p: IconProps) => <GlyphIcon glyph="⬢" {...p} />
Hexagon.displayName = 'Icon.Hexagon'

const Hourglass = (p: IconProps) => <GlyphIcon glyph="⧖" {...p} />
Hourglass.displayName = 'Icon.Hourglass'

const SquareInSquare = (p: IconProps) => <GlyphIcon glyph="▣" {...p} />
SquareInSquare.displayName = 'Icon.SquareInSquare'

const DharmaWheel = (p: IconProps) => <GlyphIcon glyph="☸" {...p} />
DharmaWheel.displayName = 'Icon.DharmaWheel'

const Watch = (p: IconProps) => <GlyphIcon glyph="⌚" {...p} />
Watch.displayName = 'Icon.Watch'

const Pencil = (p: IconProps) => <GlyphIcon glyph="✎" {...p} />
Pencil.displayName = 'Icon.Pencil'

// Aliased on export to avoid shadowing the JS global within this module.
const InfinitySymbol = (p: IconProps) => <GlyphIcon glyph="∞" {...p} />
InfinitySymbol.displayName = 'Icon.Infinity'

// ─── Status / control ───────────────────────────────────────────────────

const Warning = (p: IconProps) => <GlyphIcon glyph="⚠" {...p} />
Warning.displayName = 'Icon.Warning'

const NoEntry = (p: IconProps) => <GlyphIcon glyph="⛔" {...p} />
NoEntry.displayName = 'Icon.NoEntry'

const Check = (p: IconProps) => <GlyphIcon glyph="✓" {...p} />
Check.displayName = 'Icon.Check'

const MultiplicationX = (p: IconProps) => <GlyphIcon glyph="✕" {...p} />
MultiplicationX.displayName = 'Icon.MultiplicationX'

const BallotX = (p: IconProps) => <GlyphIcon glyph="✘" {...p} />
BallotX.displayName = 'Icon.BallotX'

const Circle = (p: IconProps) => <GlyphIcon glyph="○" {...p} />
Circle.displayName = 'Icon.Circle'

const Fisheye = (p: IconProps) => <GlyphIcon glyph="◉" {...p} />
Fisheye.displayName = 'Icon.Fisheye'

const CircledBullet = (p: IconProps) => <GlyphIcon glyph="⦿" {...p} />
CircledBullet.displayName = 'Icon.CircledBullet'

const TriangleRight = (p: IconProps) => <GlyphIcon glyph="▶" {...p} />
TriangleRight.displayName = 'Icon.TriangleRight'

// ─── Arrows ─────────────────────────────────────────────────────────────

const ArrowLeft = (p: IconProps) => <GlyphIcon glyph="←" {...p} />
ArrowLeft.displayName = 'Icon.ArrowLeft'

const ArrowRight = (p: IconProps) => <GlyphIcon glyph="→" {...p} />
ArrowRight.displayName = 'Icon.ArrowRight'

const ArrowUp = (p: IconProps) => <GlyphIcon glyph="↑" {...p} />
ArrowUp.displayName = 'Icon.ArrowUp'

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
