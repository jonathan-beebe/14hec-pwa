import { glyphIcon, type IconComponent } from './Icon'

/**
 * Zodiac sign icons as unicode glyphs (♈–♓).
 *
 * These codepoints aren't in Inter or in what generic `sans-serif`
 * resolves to, so without help they tofu. The Tailwind `font-symbol`
 * family stack (Apple Symbols / Segoe UI Symbol / Noto Sans Symbols /
 * serif) routes through a font that has them, and is applied
 * automatically by both `GlyphIcon` (DOM) and `SandIcon` (canvas).
 * Consumers don't need to do anything.
 *
 * @example
 * <ZodiacSymbol.Aries />
 * <SandIcon source={ZodiacSymbol.Aries.source} />
 */

const Aries = glyphIcon('Aries', '♈')
const Taurus = glyphIcon('Taurus', '♉')
const Gemini = glyphIcon('Gemini', '♊')
const Cancer = glyphIcon('Cancer', '♋')
const Leo = glyphIcon('Leo', '♌')
const Virgo = glyphIcon('Virgo', '♍')
const Libra = glyphIcon('Libra', '♎')
const Scorpio = glyphIcon('Scorpio', '♏')
const Sagittarius = glyphIcon('Sagittarius', '♐')
const Capricorn = glyphIcon('Capricorn', '♑')
const Aquarius = glyphIcon('Aquarius', '♒')
const Pisces = glyphIcon('Pisces', '♓')

export const ZodiacSymbol = {
  Aries,
  Taurus,
  Gemini,
  Cancer,
  Leo,
  Virgo,
  Libra,
  Scorpio,
  Sagittarius,
  Capricorn,
  Aquarius,
  Pisces,
} as const

export type ZodiacSymbolName = keyof typeof ZodiacSymbol

// Re-export the IconComponent type for consumers that want to type
// against the namespace's value shape directly.
export type { IconComponent }
