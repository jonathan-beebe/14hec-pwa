export interface Season {
  name: string
  slug: string
  months: string
  icon: string
  element: string
  color: string
  textColor: string
  gradient: string
  signs: string[]
  description: string
  themes: string[]
  activities: string[]
  plantFocus: string[]
  preparationFocus: string[]
  bodyFocus: string
}

export const SEASONS: Season[] = [
  {
    name: 'Spring',
    slug: 'spring',
    months: 'March - May',
    icon: '☘',
    element: 'Air',
    color: 'green',
    textColor: 'text-green-300',
    gradient: 'linear-gradient(135deg, rgba(61, 138, 94, 0.12), rgba(16, 15, 12, 0.85))',
    signs: ['Aries', 'Taurus', 'Gemini'],
    description: 'The season of renewal and emergence. Plants are at their most vital as sap rises and new growth appears. This is the optimal time for harvesting aerial parts: young leaves, flowers, and fresh shoots.',
    themes: ['Renewal', 'Purification', 'New beginnings', 'Vitality'],
    activities: ['Harvest spring greens (nettle, dandelion)', 'Plant medicinal garden beds', 'Make fresh flower essences', 'Spring liver cleanse protocols'],
    plantFocus: ['Nettle', 'Dandelion', 'Yarrow', 'Elderflower', 'Chamomile'],
    preparationFocus: ['Flower Essence', 'Infusion', 'Whole Food'],
    bodyFocus: 'Liver, gallbladder, lymphatic system, blood purification'
  },
  {
    name: 'Summer',
    slug: 'summer',
    months: 'June - August',
    icon: '☉',
    element: 'Fire',
    color: 'amber',
    textColor: 'text-amber-300',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 15, 12, 0.85))',
    signs: ['Cancer', 'Leo', 'Virgo'],
    description: 'Peak solar energy. Plants are in full bloom and at maximum potency. The long days favor solar preparations and drying herbs for winter medicine-making. Harvest flowers at noon on sunny days for peak essential oil content.',
    themes: ['Abundance', 'Solar vitality', 'Full expression', 'Harvest'],
    activities: ['Harvest St. John\'s Wort at midsummer', 'Dry herbs for winter stores', 'Make solar-infused oils', 'Prepare sun teas and tinctures'],
    plantFocus: ['St. John\'s Wort', 'Rosemary', 'Lavender', 'Rose', 'Chamomile'],
    preparationFocus: ['Tincture', 'Infusion', 'Flower Essence'],
    bodyFocus: 'Heart, circulatory system, skin, vitality, adrenals'
  },
  {
    name: 'Autumn',
    slug: 'autumn',
    months: 'September - November',
    icon: '❁',
    element: 'Water',
    color: 'orange',
    textColor: 'text-orange-300',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(16, 15, 12, 0.85))',
    signs: ['Libra', 'Scorpio', 'Sagittarius'],
    description: 'The season of harvest and turning inward. Plant energy descends into roots and seeds. This is the prime time for root harvesting (after the aerial parts have died back) and seed collection for planting and medicine.',
    themes: ['Harvest', 'Introspection', 'Release', 'Preparation'],
    activities: ['Harvest roots (ashwagandha, ginger, comfrey)', 'Make decoctions from dried roots', 'Prepare immune-building protocols', 'Collect seeds for next year'],
    plantFocus: ['Ashwagandha', 'Ginger', 'Comfrey', 'Reishi', 'Elderflower'],
    preparationFocus: ['Decoction', 'Tincture', 'Ground/Capsule'],
    bodyFocus: 'Lungs, large intestine, immune system, nervous system'
  },
  {
    name: 'Winter',
    slug: 'winter',
    months: 'December - February',
    icon: '❄',
    element: 'Earth',
    color: 'blue',
    textColor: 'text-blue-300',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 15, 12, 0.85))',
    signs: ['Capricorn', 'Aquarius', 'Pisces'],
    description: 'The season of stillness and deep rest. Focus on inner work, dream practice, and building reserves. Plants rest too, but dried and preserved medicines carry us through. Spagyric preparations and long-steeping tinctures are winter work.',
    themes: ['Rest', 'Dream work', 'Deep nourishment', 'Inner vision'],
    activities: ['Work with dream herbs (mugwort)', 'Make long-steeping bone broths', 'Practice cold-weather breathwork', 'Tend to spagyric preparations'],
    plantFocus: ['Mugwort', 'Reishi', 'Ashwagandha', 'Sage', 'Cannabis'],
    preparationFocus: ['Spagyric', 'Decoction', 'Smoked'],
    bodyFocus: 'Kidneys, bones, joints, reproductive system, dream body'
  }
]

export function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export function getSeasonBySlug(slug: string): Season | undefined {
  return SEASONS.find(s => s.slug === slug)
}
