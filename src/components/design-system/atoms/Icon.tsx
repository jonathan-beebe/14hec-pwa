import type { HTMLAttributes } from 'react'

/**
 * Icon library for the 14 HEC design system.
 *
 * Each icon is a named component. The current implementation renders the
 * source unicode glyph at a controlled size — no invented artwork. SVGs
 * can replace the implementations later without touching call sites:
 *
 *   <Icon.Plant />        // today: ☘ at 24px
 *                         // later: an SVG drawn from the same glyph
 *
 * Color flows from the parent's text color (the glyph is text). Canonical
 * sizes are 16 / 20 / 24 (default 24). Pass `size` for fixed pixel sizing
 * or use `className` to size via Tailwind (`text-2xl`, etc).
 *
 * Decorative by default (`aria-hidden`). When an icon carries meaning on
 * its own, pass `aria-label` and `aria-hidden={false}`.
 *
 * Source mapping (icon → unicode):
 *   Plant   → ☘  U+2618 SHAMROCK
 *   Ailment → ⚕  U+2695 STAFF OF AESCULAPIUS
 *   Zodiac  → ☉  U+2609 SUN
 *   Heart   → ♡  U+2661 WHITE HEART SUIT
 *   Mind    → ⚛  U+269B ATOM SYMBOL (cognition/structure)
 *   Body    → ☥  U+2625 ANKH (life/body)
 *   Spirit  → ✦  U+2726 BLACK FOUR POINTED STAR
 */

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Canonical sizes: 16 | 20 | 24. Optional — when omitted, the icon
   * inherits its parent's font-size. Pass an explicit value when the
   * surrounding context doesn't already define one.
   */
  size?: number
}

interface GlyphIconProps extends IconProps {
  glyph: string
}

function GlyphIcon({ size, glyph, style, ...rest }: GlyphIconProps) {
  const sizeStyle = size !== undefined ? { fontSize: size } : null
  return (
    <span
      aria-hidden="true"
      style={{ lineHeight: 1, ...sizeStyle, ...style }}
      {...rest}
    >
      {glyph}
    </span>
  )
}

const Plant = (props: IconProps) => <GlyphIcon glyph="☘" {...props} />
Plant.displayName = 'Icon.Plant'

const Ailment = (props: IconProps) => <GlyphIcon glyph="⚕" {...props} />
Ailment.displayName = 'Icon.Ailment'

const Zodiac = (props: IconProps) => <GlyphIcon glyph="☉" {...props} />
Zodiac.displayName = 'Icon.Zodiac'

const Heart = (props: IconProps) => <GlyphIcon glyph="♡" {...props} />
Heart.displayName = 'Icon.Heart'

const Mind = (props: IconProps) => <GlyphIcon glyph="⚛" {...props} />
Mind.displayName = 'Icon.Mind'

const Body = (props: IconProps) => <GlyphIcon glyph="☥" {...props} />
Body.displayName = 'Icon.Body'

const Spirit = (props: IconProps) => <GlyphIcon glyph="✦" {...props} />
Spirit.displayName = 'Icon.Spirit'

export const Icon = {
  Plant,
  Ailment,
  Zodiac,
  Heart,
  Mind,
  Body,
  Spirit,
}
