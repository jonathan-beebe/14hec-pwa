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

// Taurus — bull head: circle with two outward-curving horns above.
const Taurus = svgIcon(
  'Taurus',
  '0 0 24 24',
  <>
    <circle cx="12" cy="15" r="5" />
    <path d="M 7 11 C 6 9, 5 6, 8 5" />
    <path d="M 17 11 C 18 9, 19 6, 16 5" />
  </>,
)

// Gemini — Roman numeral II: two parallel verticals with capping bars.
const Gemini = svgIcon(
  'Gemini',
  '0 0 24 24',
  <>
    <path d="M 6 6 H 12" />
    <path d="M 6 18 H 12" />
    <path d="M 9 6 V 18" />
    <path d="M 12 6 H 18" />
    <path d="M 12 18 H 18" />
    <path d="M 15 6 V 18" />
  </>,
)

// Cancer — two opposing circle-and-tail forms (the "69" rotated).
const Cancer = svgIcon(
  'Cancer',
  '0 0 24 24',
  <>
    <circle cx="9" cy="10" r="2" />
    <circle cx="15" cy="14" r="2" />
    <path d="M 9 8 C 4 8, 4 16, 11 16" />
    <path d="M 15 16 C 20 16, 20 8, 13 8" />
  </>,
)

// Leo — looped head with a tail trailing down-right.
const Leo = svgIcon(
  'Leo',
  '0 0 24 24',
  <>
    <path d="M 9 14 C 4 14, 4 6, 11 6 C 18 6, 18 13, 14 14 C 17 16, 19 18, 19 20" />
  </>,
)

// Virgo — two arches with a final loop (cursive "m" with a knot).
const Virgo = svgIcon(
  'Virgo',
  '0 0 24 24',
  <>
    <path d="M 5 18 V 8 C 5 7, 7 7, 7 8 V 18" />
    <path d="M 7 12 V 8 C 7 7, 9 7, 9 8 V 18" />
    <path d="M 9 12 V 8 C 9 7, 11 7, 11 8 V 18 C 11 21, 14 21, 14 18 C 14 15, 11 16, 11 14" />
  </>,
)

// Libra — scales: horizontal beam with a low arch resting on top.
const Libra = svgIcon(
  'Libra',
  '0 0 24 24',
  <>
    <path d="M 4 18 H 20" />
    <path d="M 6 14 H 18" />
    <path d="M 8 14 C 8 9, 16 9, 16 14" />
  </>,
)

// Scorpio — three arches like Virgo, ending in an upturned arrow tail.
const Scorpio = svgIcon(
  'Scorpio',
  '0 0 24 24',
  <>
    <path d="M 4 18 V 8 C 4 7, 6 7, 6 8 V 18" />
    <path d="M 6 12 V 8 C 6 7, 8 7, 8 8 V 18" />
    <path d="M 8 12 V 8 C 8 7, 10 7, 10 8 V 18 L 18 10" />
    <path d="M 14 10 H 18 V 14" />
  </>,
)

// Sagittarius — diagonal arrow with a crossbar near the tail.
const Sagittarius = svgIcon(
  'Sagittarius',
  '0 0 24 24',
  <>
    <path d="M 5 19 L 19 5" />
    <path d="M 13 5 H 19 V 11" />
    <path d="M 8 12 L 12 16" />
  </>,
)

// Capricorn — "n" connecting into a downward-curling sea-goat horn.
const Capricorn = svgIcon(
  'Capricorn',
  '0 0 24 24',
  <>
    <path d="M 4 8 V 18" />
    <path d="M 4 8 C 4 6, 8 6, 8 10 V 18" />
    <path d="M 8 18 C 8 14, 12 11, 14 14 C 16 11, 20 14, 18 16 C 16 18, 13 17, 13 14" />
  </>,
)

// Aquarius — two parallel water-wave zigzags.
const Aquarius = svgIcon(
  'Aquarius',
  '0 0 24 24',
  <>
    <path d="M 4 10 L 8 13 L 12 10 L 16 13 L 20 10" />
    <path d="M 4 15 L 8 18 L 12 15 L 16 18 L 20 15" />
  </>,
)

// Pisces — two outward-facing arcs joined by a horizontal cord.
const Pisces = svgIcon(
  'Pisces',
  '0 0 24 24',
  <>
    <path d="M 7 5 C 4 9, 4 15, 7 19" />
    <path d="M 17 5 C 20 9, 20 15, 17 19" />
    <path d="M 4 12 H 20" />
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
