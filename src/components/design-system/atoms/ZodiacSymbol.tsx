import { svgIcon, type IconComponent } from './Icon'

/**
 * Hand-drawn SVG glyphs for the 12 zodiac signs.
 *
 * The unicode codepoints (♈–♓) tofu on macOS / Inter combinations,
 * which the SandIcon rasterizer surfaces as a featureless square in
 * place of the glyph silhouette. Outlined SVG paths give us a
 * reliable, brand-consistent silhouette that rasterizes the same way
 * across platforms.
 *
 * Each glyph is drawn as stroke-only paths in a 24×24 viewBox.
 * `Icon.svgIcon` (and the SandIcon SVG path in glyphSampler) wrap
 * children in a neutral `<g fill="none" stroke="currentColor"
 * stroke-width="1.5">`, so paths should NOT carry their own
 * fill/stroke attributes — they inherit. Use round caps + joins to
 * keep small endings smooth.
 *
 * These are first-draft glyphs aimed at being recognisable at sand
 * silhouette scale (≥120px). Refine path data to taste.
 *
 * @example
 * <ZodiacSymbol.Aries />
 * <SandIcon source={ZodiacSymbol.Aries.source} />
 */

// Aries — V peaking at the bottom, each upper branch curling outward
// and hooking back inward like a ram's horn. Two mirrored strokes that
// share the bottom apex; each stroke is one V leg + one horn curl.
const Aries = svgIcon(
  'Aries',
  '0 0 24 24',
  <>
    <path d="M 12 19 L 9 8 C 9 4, 2 4, 2 9 C 2 12, 7 12, 7 10" />
    <path d="M 12 19 L 15 8 C 15 4, 22 4, 22 9 C 22 12, 17 12, 17 10" />
  </>,
)

// Taurus — bull head: full circle with two crescent horns sweeping up
// and outward from the top of the circle, tips curling inward toward
// each other at the top.
const Taurus = svgIcon(
  'Taurus',
  '0 0 24 24',
  <>
    <circle cx="12" cy="15" r="5" />
    <path d="M 8 11 C 3 9, 2 4, 7 4 C 9 4, 10 5, 10 7" />
    <path d="M 16 11 C 21 9, 22 4, 17 4 C 15 4, 14 5, 14 7" />
  </>,
)

// Gemini — Roman numeral II framed by bracketed top/bottom bars: each
// horizontal bar curves down (top) or up (bottom) at its ends to give
// the symbol soft serif corners. Two parallel verticals run between.
const Gemini = svgIcon(
  'Gemini',
  '0 0 24 24',
  <>
    <path d="M 6 7 C 6 5, 7 5, 8 5 H 16 C 17 5, 18 5, 18 7" />
    <path d="M 6 17 C 6 19, 7 19, 8 19 H 16 C 17 19, 18 19, 18 17" />
    <path d="M 9 5 V 19" />
    <path d="M 15 5 V 19" />
  </>,
)

// Cancer — two opposing circle-and-tail forms ("69" rotated 90°).
// Upper-left disc with a sweeping arc descending to the right; lower-
// right disc mirrors it with an arc ascending to the left.
const Cancer = svgIcon(
  'Cancer',
  '0 0 24 24',
  <>
    <circle cx="7" cy="9" r="2" />
    <path d="M 9 9 C 15 9, 17 11, 17 13" />
    <circle cx="17" cy="15" r="2" />
    <path d="M 15 15 C 9 15, 7 13, 7 11" />
  </>,
)

// Leo — closed mane loop in the upper-left, single continuous stroke
// continuing into a tail that swoops down to the right and hooks
// upward at the tip.
const Leo = svgIcon(
  'Leo',
  '0 0 24 24',
  <>
    <path d="M 11 13 C 4 13, 4 4, 11 4 C 16 4, 17 9, 13 11 L 18 17 C 19 19, 21 19, 21 17" />
  </>,
)

// Virgo — three arched legs (cursive "m"); the final leg's foot curls
// outward to the right and hooks back through itself, forming the
// signature closing flourish.
const Virgo = svgIcon(
  'Virgo',
  '0 0 24 24',
  <>
    <path d="M 4 19 V 8 C 4 6, 8 6, 8 8 V 19" />
    <path d="M 8 10 V 8 C 8 6, 12 6, 12 8 V 19" />
    <path d="M 12 10 V 8 C 12 6, 16 6, 16 8 V 17 C 16 22, 22 22, 22 15 C 22 12, 17 12, 17 17" />
  </>,
)

// Libra — omega arch sitting above a horizontal baseline. Two short
// feet extend outward from the bottom of the arch.
const Libra = svgIcon(
  'Libra',
  '0 0 24 24',
  <>
    <path d="M 3 19 H 21" />
    <path d="M 3 14 H 7" />
    <path d="M 17 14 H 21" />
    <path d="M 7 14 C 4 14, 3 5, 12 5 C 21 5, 20 14, 17 14" />
  </>,
)

// Scorpio — three arched legs like Virgo, but the final leg's foot
// extends outward as a diagonal tail tipped with an arrowhead pointing
// up-right (the scorpion's stinger).
const Scorpio = svgIcon(
  'Scorpio',
  '0 0 24 24',
  <>
    <path d="M 3 19 V 8 C 3 6, 7 6, 7 8 V 19" />
    <path d="M 7 10 V 8 C 7 6, 11 6, 11 8 V 19" />
    <path d="M 11 10 V 8 C 11 6, 15 6, 15 8 V 18 L 21 13" />
    <path d="M 17 11 L 21 13 L 20 17" />
  </>,
)

// Sagittarius — archer's arrow shooting up-right, with an L-shaped
// arrowhead at the upper-right tip and a perpendicular crossbar tick
// across the lower half of the shaft.
const Sagittarius = svgIcon(
  'Sagittarius',
  '0 0 24 24',
  <>
    <path d="M 4 20 L 20 4" />
    <path d="M 13 4 H 20 V 11" />
    <path d="M 6 13 L 13 20" />
  </>,
)

// Capricorn — sea-goat: an "n"-style hump on the left (the goat),
// continuing through a low arch into an inward-spiraling fish tail on
// the right. Drawn as a single continuous stroke.
const Capricorn = svgIcon(
  'Capricorn',
  '0 0 24 24',
  <>
    <path d="M 4 19 V 8 C 4 5, 9 5, 9 9 V 15 C 9 18, 13 19, 14 15 C 14 11, 19 11, 19 15 C 19 18, 16 19, 14.5 17 C 13.5 15, 16 13, 18 15" />
  </>,
)

// Aquarius — water-bearer: two parallel zigzag wave lines, each with
// three peaks. Sharp angular zigzags rather than smooth waves.
const Aquarius = svgIcon(
  'Aquarius',
  '0 0 24 24',
  <>
    <path d="M 3 9 L 6 12 L 9 9 L 12 12 L 15 9 L 18 12 L 21 9" />
    <path d="M 3 15 L 6 18 L 9 15 L 12 18 L 15 15 L 18 18 L 21 15" />
  </>,
)

// Pisces — two outward-bowing crescents (left bows left, right bows
// right) tied together by a horizontal cord through their middles.
const Pisces = svgIcon(
  'Pisces',
  '0 0 24 24',
  <>
    <path d="M 7 4 C 3 8, 3 16, 7 20" />
    <path d="M 17 4 C 21 8, 21 16, 17 20" />
    <path d="M 3 12 H 21" />
  </>,
)

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
