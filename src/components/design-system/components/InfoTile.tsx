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
 * Per-tone frame tint: a tone-tinted border and a tone-glow shadow on
 * hover. Border + shadow animate fine via `.card`'s transition-all; the
 * gradient itself lives in stacked overlay divs (`toneRestingGradient`
 * / `toneEngagedGradient` below) that crossfade via opacity, since CSS
 * gradient interpolation through Tailwind's `--tw-gradient-*` custom
 * properties is unreliable.
 */
const toneFrameClass: Record<InfoTileTone, string> = {
  botanical:
    'border-botanical-400/20 hover:border-botanical-400/40 hover:shadow-glow-botanical active:shadow-glow-botanical-sm',
  celestial:
    'border-celestial-400/20 hover:border-celestial-400/40 hover:shadow-glow-celestial active:shadow-glow-celestial-sm',
  gold:
    'border-gold-400/20 hover:border-gold-400/40 hover:shadow-glow-amber active:shadow-glow-amber-sm',
  heart:
    'border-rose-400/20 hover:border-rose-400/40 hover:shadow-glow-heart active:shadow-glow-heart-sm',
  mind:
    'border-blue-400/20 hover:border-blue-400/40 hover:shadow-glow-mind active:shadow-glow-mind-sm',
  body:
    'border-green-400/20 hover:border-green-400/40 hover:shadow-glow-body active:shadow-glow-body-sm',
  spirit:
    'border-purple-400/20 hover:border-purple-400/40 hover:shadow-glow-spirit active:shadow-glow-spirit-sm',
}

// Resting gradient — corner accent at 0.20 alpha fading out by 33%.
const toneRestingGradient: Record<InfoTileTone, string> = {
  botanical: 'bg-gradient-to-br from-botanical-500/20 to-transparent to-[33%]',
  celestial: 'bg-gradient-to-br from-celestial-500/20 to-transparent to-[33%]',
  gold:      'bg-gradient-to-br from-gold-500/20 to-transparent to-[33%]',
  heart:     'bg-gradient-to-br from-rose-500/20 to-transparent to-[33%]',
  mind:      'bg-gradient-to-br from-blue-500/20 to-transparent to-[33%]',
  body:      'bg-gradient-to-br from-green-500/20 to-transparent to-[33%]',
  spirit:    'bg-gradient-to-br from-purple-500/20 to-transparent to-[33%]',
}

// Engaged gradient — brighter (0.30) and a wider sweep (45%). Crossfades
// in over the resting layer on hover/focus via group-state opacity.
const toneEngagedGradient: Record<InfoTileTone, string> = {
  botanical: 'bg-gradient-to-br from-botanical-500/30 to-transparent to-[45%]',
  celestial: 'bg-gradient-to-br from-celestial-500/30 to-transparent to-[45%]',
  gold:      'bg-gradient-to-br from-gold-500/30 to-transparent to-[45%]',
  heart:     'bg-gradient-to-br from-rose-500/30 to-transparent to-[45%]',
  mind:      'bg-gradient-to-br from-blue-500/30 to-transparent to-[45%]',
  body:      'bg-gradient-to-br from-green-500/30 to-transparent to-[45%]',
  spirit:    'bg-gradient-to-br from-purple-500/30 to-transparent to-[45%]',
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
// Body silhouette geometry. The icon slot uses `-ml-2` (-8px) to pull
// the glyph 8px into the card's left padding, so the visible icon center
// sits at x = 20 (p-5) − 8 (-ml-2) + 48 (half of w-24) = 60 from the
// card's border-box left edge. The mask cutoff keeps the body fully
// opaque through ~130px and fades the wind tail to transparent before
// it reaches the text — independent of card width.
const SAND_BODY_SIZE = 96
const SAND_BODY_OFFSET_X = 60
const SAND_MASK_GRADIENT = 'linear-gradient(to right, black 130px, transparent 100%)'

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
  // hover:transform-none cancels .card:hover's translateY lift — the tone
  // border + glow already signal hover; the focus ring covers keyboard.
  // active:scale-[0.98] reads as a small z-axis recession on press,
  // pairing with the shrunken tone glow. Tailwind's active: variant
  // emits after hover:, so it overrides hover:transform-none on press.
  // overflow-hidden clips the sand canvas to the card's rounded corners
  // (no effect on the focus ring, which uses outset box-shadow).
  const focusClass =
    'focus-visible:ring-botanical-400 hover:transform-none active:scale-[0.98] motion-reduce:transition-none'
  // shadow-[...] overrides .card's resting box-shadow with a stronger drop
  // (deeper offset, wider blur, higher alpha) while preserving the inset
  // top-edge highlight. On hover, hover:shadow-glow-X from toneFrameClass
  // takes over (utility-layer specificity wins), unchanged.
  const liftClass =
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),_0_10px_28px_-6px_rgba(0,0,0,0.7)]'
  // Press state (active:shadow-glow-X-sm) lives in toneFrameClass per
  // tone so the glow keeps its color but compresses on press, reading as
  // a z-axis sink rather than the glow vanishing. Tailwind orders
  // active: after hover: in the generated CSS, so the small glow wins
  // over hover:shadow-glow-X when both pseudo-classes are active.
  const cardClass = `card bg-black ${liftClass} flex items-center gap-4 group overflow-hidden ${toneFrameClass[tone]} ${focusClass}${className ? ` ${className}` : ''}`

  // When sand is active the canvas wrapper sits behind the text (z-0) and
  // is tinted by the icon-slot's text color (the wrapper is rendered into
  // that color context via tonePrimaryClass). The text-slot uses relative
  // z-10 to layer above it. The static icon DOM stays in flex layout for
  // sizing but is `invisible` so it doesn't compete with the canvas paint.
  return (
    <Link to={to} className={cardClass} aria-label={ariaLabel}>
      {/*
        Two stacked gradient overlays crossfade between resting and engaged
        on hover/focus. Opacity transitions are universally animatable;
        the gradient stop changes themselves are not. group-hover and
        group-focus-visible reach into descendants from the .group on this
        Link, so no React state needed.
      */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 ease-out-expo motion-reduce:transition-none group-hover:opacity-0 group-focus-visible:opacity-0 ${toneRestingGradient[tone]}`}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 ease-out-expo motion-reduce:transition-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 ${toneEngagedGradient[tone]}`}
      />
      {sandActive && (
        // text-8xl matches the static icon-slot's font-size — the
        // sampler reads the canvas's computed font-family + font-size so
        // canvas falls through the same character-resolution chain as
        // CSS. Without it the canvas paints at the body default (16px)
        // and selects a different fallback font, and the sand silhouette
        // disagrees with the static DOM glyph for codepoints not in the
        // first available font (⚕ is the most visible offender).
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-0 pointer-events-none text-8xl ${tonePrimaryClass[tone]}`}
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
        // text-8xl gives a 96px em-box that exactly matches the w-24
        // slot — no horizontal slack inside the slot. -ml-2 pulls the
        // slot 8px into the card's left padding so the visible glyph
        // sits closer to the card edge.
        <div
          aria-hidden="true"
          className={`w-24 text-8xl flex items-center justify-center shrink-0 -ml-2 ${
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
