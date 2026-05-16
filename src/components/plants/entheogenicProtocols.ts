export interface JourneyProtocol {
  slug: string
  name: string
  description: string
  icon: string
  phases: { name: string; duration: string; guidance: string }[]
}

export const INTEGRATION_PROTOCOLS: JourneyProtocol[] = [
  {
    slug: 'preparation',
    name: 'Preparation Phase',
    icon: '☘',
    description: 'The weeks before working with entheogenic plants. Preparation of body, mind, and space.',
    phases: [
      { name: 'Dietary Preparation', duration: '1-2 weeks before', guidance: 'Simplify diet. Reduce processed foods, caffeine, alcohol, and heavy meats. Increase fresh vegetables, fruits, and clean water. Some traditions recommend a specific dieta.' },
      { name: 'Intention Setting', duration: '3-7 days before', guidance: 'Clarify your intention. Why are you seeking this experience? Write it down. Share it with a trusted guide or friend. Let the intention be a question, not a demand.' },
      { name: 'Space Preparation', duration: '1-3 days before', guidance: 'Clean and prepare your environment. Remove distractions. Gather comfort items: blankets, water, journal, eye mask. Consider burning sage or palo santo to clear the space.' },
      { name: 'Nervous System Calming', duration: 'Day of', guidance: 'Gentle movement (yoga, walking). Breathwork. Avoid screens and stimulating content. Drink herbal tea (chamomile, lemon balm). Rest.' },
    ],
  },
  {
    slug: 'set-and-setting',
    name: 'Set & Setting',
    icon: '⌂',
    description: 'The internal and external conditions that shape the experience.',
    phases: [
      { name: 'Set (Mindset)', duration: 'Ongoing', guidance: 'Your emotional and psychological state. Address any acute anxiety or unresolved conflicts before the session. Cultivate openness, surrender, and trust.' },
      { name: 'Setting (Environment)', duration: 'Day of', guidance: 'Safe, comfortable, private space. Trusted sitter or guide present. Temperature controlled. Nature access if possible. Minimal artificial stimuli.' },
      { name: 'Music & Sound', duration: 'During', guidance: 'Curated playlist or live music. Many traditions use icaros (medicine songs), drumming, or specific frequency-based sound. Silence is also powerful.' },
      { name: 'Support Person', duration: 'Throughout', guidance: 'A sober, experienced sitter who can hold space without interfering. They should understand the medicine and be prepared for the full range of experiences.' },
    ],
  },
  {
    slug: 'integration',
    name: 'Integration Phase',
    icon: '✦',
    description: 'The critical period after the experience where insights are woven into daily life.',
    phases: [
      { name: 'Immediate (0-24 hours)', duration: 'First day', guidance: 'Rest. Journal. Eat simple, nourishing food. Drink water and herbal tea. Avoid screens, social media, and demanding social interactions. Let the experience settle.' },
      { name: 'Short-term (1-7 days)', duration: 'First week', guidance: 'Continue journaling. Spend time in nature. Gentle movement. Share the experience with a trusted person or integration circle. Notice what has shifted in your perception.' },
      { name: 'Medium-term (1-4 weeks)', duration: 'First month', guidance: 'Begin implementing insights. Make any lifestyle changes that emerged. Continue supportive herbal protocols. Attend integration sessions or therapy if available.' },
      { name: 'Long-term (ongoing)', duration: 'Months-years', guidance: 'The real work. How do the insights live in your daily choices? Regular reflection. Community connection. Continued plant relationship through non-entheogenic allies.' },
    ],
  },
]

export function findProtocolBySlug(slug: string | undefined): JourneyProtocol | null {
  if (!slug) return null
  return INTEGRATION_PROTOCOLS.find((p) => p.slug === slug) ?? null
}
