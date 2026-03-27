import { useState, useEffect } from 'react'
import type { Page } from '../../App'
import type { Plant, Ailment } from '../../types'

interface HMBSViewProps {
  navigate: (page: Page) => void
}

interface HMBSDomain {
  name: string
  icon: string
  color: string
  textColor: string
  gradient: string
  glowShadow: string
  description: string
  bodyAreas: string
  frequency: string
  supportPlants: string[]
  supportAilments: string[]
  rituals: string[]
  element: string
}

const HMBS_DOMAINS: HMBSDomain[] = [
  {
    name: 'Heart',
    icon: '\u2661',
    color: 'rose',
    textColor: 'text-rose-300',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(244, 63, 94, 0.08)',
    description: 'The seat of love, compassion, and emotional intelligence. Heart-domain plants open the chest, warm the blood, and cultivate connection. In the Sanctuary, the Heart Room features rose-gold lighting, living rose vines, and water features.',
    bodyAreas: 'Heart, circulatory system, chest, blood, emotional body',
    frequency: '528 Hz - The love frequency',
    supportPlants: ['Rose', 'Chamomile', 'Lavender', 'Passionflower', 'Blue Lotus'],
    supportAilments: ['Anxiety', 'Grief', 'Depression', 'High blood pressure', 'Stress'],
    rituals: ['Cacao ceremony', 'Heart-opening breathwork', 'Rose water ritual', 'Sound healing at 528 Hz'],
    element: 'Water'
  },
  {
    name: 'Mind',
    icon: '\u2609',
    color: 'blue',
    textColor: 'text-blue-300',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(59, 130, 246, 0.08)',
    description: 'Clarity, cognition, and expanded awareness. Mind-domain plants sharpen focus, enhance memory, and support neurological health. The Mind Room features cool blue-white light, rosemary/mint living walls, and binaural beats at 14 Hz.',
    bodyAreas: 'Brain, nervous system, cognitive function, memory, mental clarity',
    frequency: '14 Hz - Alpha-beta transition (the 14 HEC frequency)',
    supportPlants: ['Rosemary', 'Lavender', 'Sage', 'Psilocybin Mushrooms', 'Reishi'],
    supportAilments: ['Lack of clarity', 'Fatigue', 'Headaches', 'Insomnia', 'Stress'],
    rituals: ['Binaural beat meditation at 14 Hz', 'Neurofeedback sessions', 'Lion\'s mane elixir', 'Rosemary steam inhalation'],
    element: 'Air'
  },
  {
    name: 'Body',
    icon: '\u2618',
    color: 'green',
    textColor: 'text-green-300',
    gradient: 'linear-gradient(135deg, rgba(61, 138, 94, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(61, 138, 94, 0.08)',
    description: 'Physical vitality, strength, and the wisdom of the flesh. Body-domain plants nourish tissues, reduce inflammation, and build resilience. The Body Room features earth tones, heated stone floors, and a communal herbal soaking tub.',
    bodyAreas: 'Muscles, bones, joints, digestive system, immune system, skin',
    frequency: '7.83 Hz - Schumann resonance (Earth\'s heartbeat)',
    supportPlants: ['Ashwagandha', 'Nettle', 'Ginger', 'Dandelion', 'Comfrey', 'Yarrow'],
    supportAilments: ['Chronic inflammation', 'Digestive stagnation', 'Joint pain', 'Chronic pain', 'Immune deficiency', 'Wound healing'],
    rituals: ['Herbal soaking bath', 'Sauna + cold plunge', 'Bone broth ceremony', 'Earth grounding practice'],
    element: 'Earth'
  },
  {
    name: 'Spirit',
    icon: '\u2726',
    color: 'purple',
    textColor: 'text-purple-300',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(16, 15, 12, 0.85))',
    glowShadow: '0 0 40px rgba(168, 85, 247, 0.08)',
    description: 'Transcendence, intuition, and connection to the infinite. Spirit-domain plants dissolve boundaries, expand consciousness, and open portals to the numinous. The Spirit Room is a dark, womb-like space with indigo/violet light and a star map ceiling.',
    bodyAreas: 'Pineal gland, subtle body, dream life, intuition, transpersonal awareness',
    frequency: '963 Hz - Crown chakra activation',
    supportPlants: ['Mugwort', 'Blue Lotus', 'Psilocybin Mushrooms', 'Cannabis', 'Ayahuasca', 'Passionflower'],
    supportAilments: ['Spiritual disconnection', 'Dream enhancement', 'Consciousness expansion', 'Existential distress', 'Insomnia'],
    rituals: ['Mugwort dream pillow', 'Float tank immersion', 'Gong bath ceremony', 'Sensory deprivation practice'],
    element: 'Fire/Ether'
  }
]

const DOMAIN_CSS_MAP: Record<string, string> = {
  Heart: 'heart',
  Mind: 'mind',
  Body: 'body',
  Spirit: 'spirit'
}

export default function HMBSView({ navigate }: HMBSViewProps) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [ailments, setAilments] = useState<Ailment[]>([])
  const [selectedDomain, setSelectedDomain] = useState<HMBSDomain | null>(null)

  useEffect(() => {
    window.api.getPlants().then(setPlants)
    window.api.getAilments().then(setAilments)
  }, [])

  const findPlantByName = (name: string) => plants.find((p) => p.common_name === name)
  const findAilmentByName = (name: string) => ailments.find((a) => a.name.toLowerCase() === name.toLowerCase())

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="hero-section mb-8">
        <div className="hero-orb w-60 h-60 bg-purple-500 top-0 right-0" />
        <div className="hero-orb w-40 h-40 bg-rose-500 bottom-0 left-0" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, #f43f5e, #3b82f6, #3d8a5e, #a855f7)' }} />
            <div>
              <h1 className="text-xl font-display font-bold text-gradient-hmbs tracking-wide">
                Heart {'\u00b7'} Mind {'\u00b7'} Body {'\u00b7'} Spirit
              </h1>
              <p className="text-earth-400 text-sm mt-1">
                The four domains of the Sanctuary {'\u2014'} each a doorway into plant intelligence
              </p>
            </div>
          </div>
          <p className="text-earth-500 text-xs mt-3 font-display italic">
            "The digital tool becomes the brain; the sanctuary becomes the body."
          </p>
        </div>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {HMBS_DOMAINS.map((domain) => (
          <button
            key={domain.name}
            onClick={() => setSelectedDomain(selectedDomain?.name === domain.name ? null : domain)}
            className={`hmbs-card hmbs-${DOMAIN_CSS_MAP[domain.name]} text-left ${
              selectedDomain?.name === domain.name ? 'ring-1 ring-inset ring-white/20' : ''
            }`}
            style={selectedDomain?.name === domain.name ? { boxShadow: domain.glowShadow } : undefined}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-3xl opacity-50 block mb-2">{domain.icon}</span>
                <h2 className={`text-xl font-display font-bold ${domain.textColor}`}>{domain.name}</h2>
              </div>
              <span className={`badge badge-${DOMAIN_CSS_MAP[domain.name]}`}>{domain.element}</span>
            </div>
            <p className="text-xs text-earth-400 leading-relaxed line-clamp-3">{domain.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-earth-600">{domain.frequency}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Domain Detail */}
      {selectedDomain && (
        <div className="animate-fade-in-up space-y-6">
          {/* Domain Header */}
          <div className="glass-panel p-6"
               style={{ background: selectedDomain.gradient }}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl opacity-40">{selectedDomain.icon}</span>
              <div>
                <h2 className={`text-2xl font-display font-bold ${selectedDomain.textColor}`}>
                  The {selectedDomain.name} Domain
                </h2>
                <p className="text-xs text-earth-500 mt-1">{selectedDomain.frequency}</p>
              </div>
            </div>
            <p className="text-sm text-earth-300 leading-relaxed">{selectedDomain.description}</p>
            <div className="mt-4 rounded-xl p-3"
                 style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="section-subtitle">Body Areas</div>
              <p className="text-sm text-earth-300">{selectedDomain.bodyAreas}</p>
            </div>
          </div>

          {/* Associated Plants */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl opacity-50">{'\u2618'}</span>
              <h3 className="section-title mb-0">{selectedDomain.name} Plants</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDomain.supportPlants.map((name) => {
                const plant = findPlantByName(name)
                return (
                  <button
                    key={name}
                    onClick={() => plant && navigate({ view: 'plant-detail', id: plant.id })}
                    disabled={!plant}
                    className="text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group disabled:opacity-50"
                    style={{ background: 'rgba(26, 25, 21, 0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <span className="text-botanical-400 font-medium group-hover:text-botanical-300 transition-colors">{name}</span>
                    {plant && <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Associated Ailments */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl opacity-50">{'\u2695'}</span>
              <h3 className="section-title mb-0">{selectedDomain.name} Ailments</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedDomain.supportAilments.map((name) => {
                const ailment = findAilmentByName(name)
                return ailment ? (
                  <button
                    key={name}
                    onClick={() => navigate({ view: 'ailment-detail', id: ailment.id })}
                    className={`badge badge-${DOMAIN_CSS_MAP[selectedDomain.name]} px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    {name}
                  </button>
                ) : (
                  <span key={name} className={`badge badge-${DOMAIN_CSS_MAP[selectedDomain.name]} px-3 py-1.5`}>{name}</span>
                )
              })}
            </div>
          </div>

          {/* Sanctuary Rituals */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl opacity-50">{'\u2638'}</span>
              <h3 className="section-title mb-0">Sanctuary Rituals</h3>
            </div>
            <p className="text-xs text-earth-500 mb-4">Practices for the {selectedDomain.name} Room in the physical sanctuary</p>
            <div className="space-y-2">
              {selectedDomain.rituals.map((ritual, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3"
                     style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className={`w-2 h-2 rounded-full bg-${selectedDomain.color}-400/50`} />
                  <span className="text-sm text-earth-300">{ritual}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedDomain && (
        <div className="text-center py-8 text-earth-600">
          <p className="text-sm font-display">Select a domain above to explore its plant correspondences</p>
        </div>
      )}
    </div>
  )
}
