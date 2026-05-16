export interface HMBSDomain {
  name: string
  key: 'heart' | 'mind' | 'body' | 'spirit'
  icon: string
  color: string
  textColor: string
  gradient: string
  glowShadow: string
  description: string
  bodyAreas: string
  frequency: string
  supportAilments: string[]
  rituals: string[]
  element: string
}

export const HMBS_DOMAINS: HMBSDomain[] = [
  {
    name: 'Heart',
    key: 'heart',
    icon: '♡',
    color: 'rose',
    textColor: 'text-rose-300',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(244, 63, 94, 0.08)',
    description: 'The seat of love, compassion, and emotional intelligence. Heart-domain plants open the chest, warm the blood, and cultivate connection. In the Sanctuary, the Heart Room features rose-gold lighting, living rose vines, and water features.',
    bodyAreas: 'Heart, circulatory system, chest, blood, emotional body',
    frequency: '528 Hz - The love frequency',
    supportAilments: ['Anxiety', 'Grief', 'Depression', 'High blood pressure', 'Stress'],
    rituals: ['Cacao ceremony', 'Heart-opening breathwork', 'Rose water ritual', 'Sound healing at 528 Hz'],
    element: 'Water'
  },
  {
    name: 'Mind',
    key: 'mind',
    icon: '☉',
    color: 'blue',
    textColor: 'text-blue-300',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(59, 130, 246, 0.08)',
    description: 'Clarity, cognition, and expanded awareness. Mind-domain plants sharpen focus, enhance memory, and support neurological health. The Mind Room features cool blue-white light, rosemary/mint living walls, and binaural beats at 14 Hz.',
    bodyAreas: 'Brain, nervous system, cognitive function, memory, mental clarity',
    frequency: '14 Hz - Alpha-beta transition (the 14 HEC frequency)',
    supportAilments: ['Lack of clarity', 'Fatigue', 'Headaches', 'Insomnia', 'Stress'],
    rituals: ['Binaural beat meditation at 14 Hz', 'Neurofeedback sessions', 'Lion\'s mane elixir', 'Rosemary steam inhalation'],
    element: 'Air'
  },
  {
    name: 'Body',
    key: 'body',
    icon: '☘',
    color: 'green',
    textColor: 'text-green-300',
    gradient: 'linear-gradient(135deg, rgba(61, 138, 94, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(61, 138, 94, 0.08)',
    description: 'Physical vitality, strength, and the wisdom of the flesh. Body-domain plants nourish tissues, reduce inflammation, and build resilience. The Body Room features earth tones, heated stone floors, and a communal herbal soaking tub.',
    bodyAreas: 'Muscles, bones, joints, digestive system, immune system, skin',
    frequency: '7.83 Hz - Schumann resonance (Earth\'s heartbeat)',
    supportAilments: ['Chronic inflammation', 'Digestive stagnation', 'Joint pain', 'Chronic pain', 'Immune deficiency', 'Wound healing'],
    rituals: ['Herbal soaking bath', 'Sauna + cold plunge', 'Bone broth ceremony', 'Earth grounding practice'],
    element: 'Earth'
  },
  {
    name: 'Spirit',
    key: 'spirit',
    icon: '✦',
    color: 'purple',
    textColor: 'text-purple-300',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(168, 85, 247, 0.08)',
    description: 'Transcendence, intuition, and connection to the infinite. Spirit-domain plants dissolve boundaries, expand consciousness, and open portals to the numinous. The Spirit Room is a dark, womb-like space with indigo/violet light and a star map ceiling.',
    bodyAreas: 'Pineal gland, subtle body, dream life, intuition, transpersonal awareness',
    frequency: '963 Hz - Crown chakra activation',
    supportAilments: ['Spiritual disconnection', 'Dream enhancement', 'Consciousness expansion', 'Existential distress', 'Insomnia'],
    rituals: ['Mugwort dream pillow', 'Float tank immersion', 'Gong bath ceremony', 'Sensory deprivation practice'],
    element: 'Fire/Ether'
  }
]

export const DOMAIN_CSS_MAP: Record<string, string> = {
  Heart: 'heart',
  Mind: 'mind',
  Body: 'body',
  Spirit: 'spirit'
}

export const STRENGTH_LABELS: Record<string, string> = {
  primary: 'Core',
  secondary: 'Supporting',
  tertiary: 'Minor'
}

export function getDomainByKey(key: string): HMBSDomain | undefined {
  return HMBS_DOMAINS.find(d => d.key === key)
}
