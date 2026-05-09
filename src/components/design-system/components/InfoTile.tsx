import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { IconSource } from '../atoms/Icon'
import SandIcon, { useReducedMotion } from '../atoms/SandIcon'

/**
 * Tone defines the primary content's color. The card frame is neutral for
 * all tones — only the top-right large content shifts.
 */
export type InfoTileTone =
  | 'botanical'
  | 'celestial'
  | 'gold'
  | 'heart'
  | 'mind'
  | 'body'
  | 'spirit'

export interface InfoTileProps {
  /** Internal SPA route. Rendered as a real `<a>` (react-router `<Link>`). */
  to: string
  tone?: InfoTileTone
  icon?: ReactNode
  /** Large top-right content: stat number, domain name, or any ReactNode. */
  primary: ReactNode
  /** Small bottom-right descriptive text: label or caption. */
  secondary?: ReactNode
  className?: string
  /**
   * Explicit accessible name for the link. Use when `primary` or `secondary`
   * is non-textual (a number alone, a component, an icon), so screen-reader
   * users hear a meaningful name instead of just "207". When omitted, the
   * link's name is derived from visible primary + secondary text.
   */
  'aria-label'?: string
  /**
   * Optional sand-particle rendering of the icon. When set AND the user has
   * not requested reduced motion, the icon slot is overlaid by a canvas
   * that animates the glyph as drifting sand with a wind tail extending
   * right behind the text. The `icon` prop is rendered as the static
   * fallback when reduced motion is on or the canvas can't initialize.
   * Pass `Icon.X.source` from the Icon library.
   */
  sandIcon?: IconSource
}

type VariantInfoTileProps = Omit<InfoTileProps, 'tone'>

const tonePrimaryClass: Record<InfoTileTone, string> = {
  botanical: 'text-botanical-300',
  celestial: 'text-celestial-300',
  gold: 'text-gold-300',
  heart: 'text-rose-300',
  mind: 'text-blue-300',
  body: 'text-green-300',
  spirit: 'text-purple-300',
}

/**
 * Per-tone frame tint: a gradient overlay on the card base, a tone-tinted
 * border, and a tone-glow shadow on hover. Layers on top of `.card`'s glass
 * frame; both `background-color` (from .card) and `background-image` (from
 * the Tailwind gradient utility) coexist, so the tint appears over the dark
 * base.
 */
const toneFrameClass: Record<InfoTileTone, string> = {
  botanical:
    'bg-gradient-to-br from-botanical-500/10 to-transparent border-botanical-400/20 hover:border-botanical-400/40 hover:shadow-glow-botanical',
  celestial:
    'bg-gradient-to-br from-celestial-500/10 to-transparent border-celestial-400/20 hover:border-celestial-400/40 hover:shadow-glow-celestial',
  gold:
    'bg-gradient-to-br from-gold-500/10 to-transparent border-gold-400/20 hover:border-gold-400/40 hover:shadow-glow-amber',
  heart:
    'bg-gradient-to-br from-rose-500/10 to-transparent border-rose-400/20 hover:border-rose-400/40 hover:shadow-glow-heart',
  mind:
    'bg-gradient-to-br from-blue-500/10 to-transparent border-blue-400/20 hover:border-blue-400/40 hover:shadow-glow-mind',
  body:
    'bg-gradient-to-br from-green-500/10 to-transparent border-green-400/20 hover:border-green-400/40 hover:shadow-glow-body',
  spirit:
    'bg-gradient-to-br from-purple-500/10 to-transparent border-purple-400/20 hover:border-purple-400/40 hover:shadow-glow-spirit',
}

/**
 * Two-column navigation tile: icon on the left, primary + secondary text on
 * the right. Merges the StatCard (count + label) and DomainCard (domain +
 * description) shapes into one component. Frame is the neutral `card`
 * class for every tone; tone shifts only the primary text color.
 *
 * Renders `<Link>` (anchor) so middle-click, ⌘-click, right-click → "Open
 * in new tab", and screen-reader "link" semantics all work.
 *
 * Prefer the variant subcomponents at call sites:
 *   `<InfoTile.Botanical>`, `<InfoTile.Heart>`, etc.
 *
 * @example
 * <InfoTile.Botanical to="/plants" icon="☘" primary={207} secondary="Plants" />
 * <InfoTile.Heart to="/hmbs" icon="♡" primary="Heart"
 *   secondary="Love, connection, empathy" />
 */
// Body silhouette geometry. p-5 (20px) + half of w-12 (24px) puts the body
// center at x=44 from the card's padding-box left edge. The mask cutoff
// keeps the body fully opaque through ~75px and fades the wind tail to
// transparent before it reaches the text — independent of card width.
const SAND_BODY_SIZE = 48
const SAND_BODY_OFFSET_X = 44
const SAND_MASK_GRADIENT = 'linear-gradient(to right, black 75px, transparent 100%)'

function InfoTile({
  to,
  tone = 'botanical',
  icon,
  primary,
  secondary,
  className,
  'aria-label': ariaLabel,
  sandIcon,
}: InfoTileProps) {
  const reducedMotion = useReducedMotion()
  const sandActive = sandIcon !== undefined && !reducedMotion

  // focus-visible:ring-botanical-400 overrides the global :focus-visible
  // ring (botanical-500/40, ~1.7:1 against the card surface) with a solid
  // botanical-400 ring (~7:1) — meets WCAG 1.4.11 non-text contrast.
  // motion-reduce:* disables the card's hover-lift transform and 300ms
  // transition for users with prefers-reduced-motion.
  // overflow-hidden clips the sand canvas to the card's rounded corners
  // (no effect on the focus ring, which uses outset box-shadow).
  const focusClass =
    'focus-visible:ring-botanical-400 motion-reduce:transition-none motion-reduce:hover:transform-none'
  const cardClass = `card flex items-center gap-4 group overflow-hidden ${toneFrameClass[tone]} ${focusClass}${className ? ` ${className}` : ''}`

  // When sand is active the canvas wrapper sits behind the text (z-0) and
  // is tinted by the icon-slot's text color (the wrapper is rendered into
  // that color context via tonePrimaryClass). The text-slot uses relative
  // z-10 to layer above it. The static icon DOM stays in flex layout for
  // sizing but is `invisible` so it doesn't compete with the canvas paint.
  return (
    <Link to={to} className={cardClass} aria-label={ariaLabel}>
      {sandActive && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-0 pointer-events-none ${tonePrimaryClass[tone]}`}
          style={{
            maskImage: SAND_MASK_GRADIENT,
            WebkitMaskImage: SAND_MASK_GRADIENT,
          }}
        >
          <SandIcon
            source={sandIcon}
            bodySize={SAND_BODY_SIZE}
            bodyOffsetX={SAND_BODY_OFFSET_X}
          />
        </div>
      )}
      {icon !== undefined && (
        <div
          aria-hidden="true"
          className={`w-12 text-4xl flex items-center justify-center shrink-0 ${
            sandActive
              ? 'invisible'
              : `opacity-60 group-hover:opacity-90 transition-opacity duration-200 motion-reduce:transition-none ${tonePrimaryClass[tone]}`
          }`}
        >
          {icon}
        </div>
      )}
      <div className="relative z-10 flex flex-col min-w-0">
        <div
          className={`text-2xl font-system font-semibold tracking-tight tabular-nums ${tonePrimaryClass[tone]}`}
        >
          {primary}
        </div>
        {secondary !== undefined && (
          <div className="text-xs text-white leading-relaxed mt-0.5">
            {secondary}
          </div>
        )}
      </div>
    </Link>
  )
}

const Botanical = (props: VariantInfoTileProps) => <InfoTile {...props} tone="botanical" />
Botanical.displayName = 'InfoTile.Botanical'

const Celestial = (props: VariantInfoTileProps) => <InfoTile {...props} tone="celestial" />
Celestial.displayName = 'InfoTile.Celestial'

const Gold = (props: VariantInfoTileProps) => <InfoTile {...props} tone="gold" />
Gold.displayName = 'InfoTile.Gold'

const Heart = (props: VariantInfoTileProps) => <InfoTile {...props} tone="heart" />
Heart.displayName = 'InfoTile.Heart'

const Mind = (props: VariantInfoTileProps) => <InfoTile {...props} tone="mind" />
Mind.displayName = 'InfoTile.Mind'

const Body = (props: VariantInfoTileProps) => <InfoTile {...props} tone="body" />
Body.displayName = 'InfoTile.Body'

const Spirit = (props: VariantInfoTileProps) => <InfoTile {...props} tone="spirit" />
Spirit.displayName = 'InfoTile.Spirit'

export default Object.assign(InfoTile, {
  Botanical,
  Celestial,
  Gold,
  Heart,
  Mind,
  Body,
  Spirit,
})
