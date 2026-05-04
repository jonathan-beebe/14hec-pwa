import { useState, useEffect } from 'react'
import { api } from '@/data/api'
import type { Plant, PlantDetail as PlantDetailType, EthicalPractice } from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'

interface JourneyProtocol {
  name: string
  description: string
  icon: string
  phases: { name: string; duration: string; guidance: string }[]
}

const INTEGRATION_PROTOCOLS: JourneyProtocol[] = [
  {
    name: 'Preparation Phase',
    icon: '\u2618',
    description: 'The weeks before working with entheogenic plants. Preparation of body, mind, and space.',
    phases: [
      { name: 'Dietary Preparation', duration: '1-2 weeks before', guidance: 'Simplify diet. Reduce processed foods, caffeine, alcohol, and heavy meats. Increase fresh vegetables, fruits, and clean water. Some traditions recommend a specific dieta.' },
      { name: 'Intention Setting', duration: '3-7 days before', guidance: 'Clarify your intention. Why are you seeking this experience? Write it down. Share it with a trusted guide or friend. Let the intention be a question, not a demand.' },
      { name: 'Space Preparation', duration: '1-3 days before', guidance: 'Clean and prepare your environment. Remove distractions. Gather comfort items: blankets, water, journal, eye mask. Consider burning sage or palo santo to clear the space.' },
      { name: 'Nervous System Calming', duration: 'Day of', guidance: 'Gentle movement (yoga, walking). Breathwork. Avoid screens and stimulating content. Drink herbal tea (chamomile, lemon balm). Rest.' }
    ]
  },
  {
    name: 'Set & Setting',
    icon: '\u2302',
    description: 'The internal and external conditions that shape the experience.',
    phases: [
      { name: 'Set (Mindset)', duration: 'Ongoing', guidance: 'Your emotional and psychological state. Address any acute anxiety or unresolved conflicts before the session. Cultivate openness, surrender, and trust.' },
      { name: 'Setting (Environment)', duration: 'Day of', guidance: 'Safe, comfortable, private space. Trusted sitter or guide present. Temperature controlled. Nature access if possible. Minimal artificial stimuli.' },
      { name: 'Music & Sound', duration: 'During', guidance: 'Curated playlist or live music. Many traditions use icaros (medicine songs), drumming, or specific frequency-based sound. Silence is also powerful.' },
      { name: 'Support Person', duration: 'Throughout', guidance: 'A sober, experienced sitter who can hold space without interfering. They should understand the medicine and be prepared for the full range of experiences.' }
    ]
  },
  {
    name: 'Integration Phase',
    icon: '\u2726',
    description: 'The critical period after the experience where insights are woven into daily life.',
    phases: [
      { name: 'Immediate (0-24 hours)', duration: 'First day', guidance: 'Rest. Journal. Eat simple, nourishing food. Drink water and herbal tea. Avoid screens, social media, and demanding social interactions. Let the experience settle.' },
      { name: 'Short-term (1-7 days)', duration: 'First week', guidance: 'Continue journaling. Spend time in nature. Gentle movement. Share the experience with a trusted person or integration circle. Notice what has shifted in your perception.' },
      { name: 'Medium-term (1-4 weeks)', duration: 'First month', guidance: 'Begin implementing insights. Make any lifestyle changes that emerged. Continue supportive herbal protocols. Attend integration sessions or therapy if available.' },
      { name: 'Long-term (ongoing)', duration: 'Months-years', guidance: 'The real work. How do the insights live in your daily choices? Regular reflection. Community connection. Continued plant relationship through non-entheogenic allies.' }
    ]
  }
]

type EthicalTab = 'context' | 'facilitation' | 'safety' | 'sourcing' | 'preparation' | 'energetic' | 'integration'

const ETHICAL_TABS: { key: EthicalTab; label: string; icon: string }[] = [
  { key: 'context', label: 'Context & Ethics', icon: '\u2696' },
  { key: 'facilitation', label: 'Facilitation', icon: '\u2B50' },
  { key: 'safety', label: 'Safety', icon: '\u26A0' },
  { key: 'sourcing', label: 'Sourcing', icon: '\u2618' },
  { key: 'preparation', label: 'Preparation', icon: '\u2697' },
  { key: 'energetic', label: 'Energetic Signature', icon: '\u2728' },
  { key: 'integration', label: 'Integration', icon: '\u221E' },
]

function EthicalPracticePanel({ data }: { data: EthicalPractice }) {
  const [activeTab, setActiveTab] = useState<EthicalTab>('context')

  const renderField = (label: string, value: string | null) => {
    if (!value) return null
    return (
      <div className="mb-3">
        <div className="text-xs font-medium text-earth-400 mb-1">{label}</div>
        <p className="text-xs text-earth-300 leading-relaxed">{value}</p>
      </div>
    )
  }

  const renderSeverities = (json: string | null) => {
    if (!json) return null
    try {
      const items = JSON.parse(json) as { item: string; level: string }[]
      return (
        <div className="mb-3">
          <div className="text-xs font-medium text-earth-400 mb-1.5">Contraindication Severity</div>
          <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: item.level === 'strict'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                  color: item.level === 'strict'
                    ? 'rgb(252, 165, 165)'
                    : 'rgb(253, 230, 138)',
                  border: item.level === 'strict'
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : '1px solid rgba(245, 158, 11, 0.2)'
                }}
              >
                <span className="opacity-70">{item.level === 'strict' ? '\u2718' : '\u26A0'}</span>
                {item.item}
              </span>
            ))}
          </div>
        </div>
      )
    } catch {
      return null
    }
  }

  const tabContent: Record<EthicalTab, JSX.Element> = {
    context: (
      <div className="animate-fade-in">
        {renderField('Daily / Self-Guided Use', data.use_context_daily)}
        {renderField('Practitioner-Guided Use', data.use_context_practitioner)}
        {renderField('Ceremonial Use', data.use_context_ceremonial)}
        {renderField('Group vs. Private', data.use_context_group_vs_private)}
        {renderField('Cultural Respect', data.cultural_respect_notes)}
        {renderField('Misuse Risks', data.misuse_risks)}
      </div>
    ),
    facilitation: (
      <div className="animate-fade-in">
        {renderField('Facilitator Qualifications', data.facilitator_qualifications)}
        {renderField('Key Qualities of a Safe Guide', data.facilitator_qualities)}
        {renderField('Red Flags to Avoid', data.facilitator_red_flags)}
        {renderField('Preparation & Integration Framework', data.preparation_framework)}
      </div>
    ),
    safety: (
      <div className="animate-fade-in">
        {renderField('Physiological Contraindications', data.physiological_contraindications)}
        {renderField('Psychological Considerations', data.psychological_considerations)}
        {renderField('Environmental Considerations', data.environmental_considerations)}
        {renderField('Dosage Sensitivity', data.dosage_sensitivity)}
        {renderField('Interaction Notes', data.interaction_notes)}
        {renderSeverities(data.contraindication_severity)}
      </div>
    ),
    sourcing: (
      <div className="animate-fade-in">
        {renderField('Native Ecosystems', data.native_ecosystems)}
        {renderField('Wildcrafted vs. Cultivated', data.wildcrafted_vs_cultivated)}
        {renderField('Sustainable Harvesting', data.sustainable_harvesting)}
        {renderField('Ethical Sourcing Concerns', data.ethical_sourcing_concerns)}
        {renderField('Sourcing Standards', data.sourcing_standards)}
      </div>
    ),
    preparation: (
      <div className="animate-fade-in">
        {renderField('Traditional Preparation', data.traditional_preparation)}
        {renderField('Modern Preparation', data.modern_preparation)}
        {renderField('Potency Notes', data.preparation_potency_notes)}
        {renderField('Intentional Practices', data.intentional_practices)}
      </div>
    ),
    energetic: (
      <div className="animate-fade-in">
        {renderField('Psychospiritual Effects', data.psychospiritual_effects)}
        {renderField('Archetypal Resonance', data.archetypal_resonance)}
        {renderField('Nervous System Influence', data.nervous_system_influence)}
        {renderField('Consciousness Interaction', data.consciousness_interaction)}
        {renderField('Spirit Teaching', data.spirit_teaching)}
      </div>
    ),
    integration: (
      <div className="animate-fade-in">
        {renderField('Body Integration', data.integration_body)}
        {renderField('Heart Integration', data.integration_heart)}
        {renderField('Mind Integration', data.integration_mind)}
        {renderField('Spirit Integration', data.integration_spirit)}
        {renderField('Signs of Healthy Integration', data.healthy_integration_signs)}
        {renderField('Signs of Incomplete Integration', data.incomplete_integration_signs)}
        {renderField('When to Seek Support', data.when_to_seek_support)}
      </div>
    ),
  }

  return (
    <div className="mt-5">
      <Text.SectionLabel className="mb-3">Ethical Practice Guide</Text.SectionLabel>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ETHICAL_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
            style={{
              background: activeTab === tab.key
                ? 'rgba(124, 94, 237, 0.15)'
                : 'rgba(24, 23, 33, 0.5)',
              border: activeTab === tab.key
                ? '1px solid rgba(124, 94, 237, 0.25)'
                : '1px solid rgba(255, 255, 255, 0.04)',
              color: activeTab === tab.key
                ? 'rgb(196, 181, 253)'
                : 'rgb(156, 163, 175)'
            }}
          >
            <span className="mr-1 opacity-60">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(24, 23, 33, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
        {tabContent[activeTab]}
      </div>
    </div>
  )
}

export default function EntheogenicGuide() {
  const [entheogenicPlants, setEntheogenicPlants] = useState<Plant[]>([])
  const [selectedPlant, setSelectedPlant] = useState<PlantDetailType | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<JourneyProtocol | null>(null)

  useEffect(() => {
    api.getPlants({ category: 'entheogenic' }).then((plants) => {
      setEntheogenicPlants(plants)
    })
    api.getPlants({ category: 'both' }).then((plants) => {
      setEntheogenicPlants((prev) => [...prev, ...plants])
    })
  }, [])

  const loadPlantDetail = async (plantId: number) => {
    const detail = await api.getPlantById(plantId)
    setSelectedPlant(detail)
    setSelectedProtocol(null)
  }

  return (
    <div className="animate-fade-in lg:h-[calc(100vh-3rem)] lg:flex lg:flex-col">
      <div className="mb-6">
        <Text.PageTitle className="text-gradient-celestial">Entheogenic Journey Guide</Text.PageTitle>
        <p className="text-sm text-earth-500 mt-1">
          Sacred plant medicine guidance: preparation, set & setting, and integration
        </p>
      </div>

      {/* Safety Banner */}
      <div className="glass-panel p-4 mb-6"
           style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(16, 15, 12, 0.8))', border: '1px solid rgba(245, 158, 11, 0.08)' }}>
        <div className="flex items-start gap-3">
          <span className="text-sm text-amber-500/70 mt-0.5">{'\u26A0'}</span>
          <div>
            <p className="text-xs text-amber-300/80 font-display font-medium mb-0.5">Sacred Responsibility</p>
            <p className="text-[11px] text-earth-500 leading-relaxed">
              Entheogenic plants are powerful teachers that demand respect, preparation, and integration.
              This guide is for educational purposes. Many of these substances have legal restrictions.
              Always research local laws, work with experienced guides, and never combine with contraindicated medications.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:flex-1 lg:min-h-0">
        {/* Plant Selection */}
        <div className="lg:col-span-1 lg:overflow-y-auto lg:pr-2">
          <Text.SectionLabel className="mb-3">Entheogenic Plants</Text.SectionLabel>
          <div className="space-y-2 mb-6">
            {entheogenicPlants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => loadPlantDetail(plant.id)}
                className="w-full text-left p-3.5 rounded-xl transition-all duration-200 ease-out-expo"
                style={{
                  background: selectedPlant?.id === plant.id
                    ? 'rgba(124, 94, 237, 0.1)'
                    : 'rgba(26, 25, 21, 0.5)',
                  border: selectedPlant?.id === plant.id
                    ? '1px solid rgba(124, 94, 237, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.04)',
                  boxShadow: selectedPlant?.id === plant.id
                    ? '0 0 24px rgba(124, 94, 237, 0.08)'
                    : undefined
                }}
              >
                <div className="text-sm text-earth-200 font-medium">{plant.common_name}</div>
                <div className="text-xs text-earth-500 italic">{plant.latin_name}</div>
                <span className={`badge badge-${plant.category} mt-1.5`}>{plant.category}</span>
              </button>
            ))}
          </div>

          {/* Protocol Selection */}
          <Text.SectionLabel className="mb-3">Journey Protocols</Text.SectionLabel>
          <div className="space-y-2">
            {INTEGRATION_PROTOCOLS.map((protocol) => (
              <button
                key={protocol.name}
                onClick={() => { setSelectedProtocol(protocol); setSelectedPlant(null) }}
                className="w-full text-left p-3.5 rounded-xl transition-all duration-200 ease-out-expo"
                style={{
                  background: selectedProtocol?.name === protocol.name
                    ? 'rgba(93, 168, 126, 0.08)'
                    : 'rgba(26, 25, 21, 0.5)',
                  border: selectedProtocol?.name === protocol.name
                    ? '1px solid rgba(93, 168, 126, 0.15)'
                    : '1px solid rgba(255, 255, 255, 0.04)',
                  boxShadow: selectedProtocol?.name === protocol.name
                    ? '0 0 24px rgba(93, 168, 126, 0.06)'
                    : undefined
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-50">{protocol.icon}</span>
                  <span className="text-sm text-earth-200">{protocol.name}</span>
                </div>
                <div className="text-xs text-earth-500 mt-1 pl-6">{protocol.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 lg:overflow-y-auto lg:pr-2">
          {selectedPlant && (
            <div className="card-glow-celestial animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Text.PageTitle as="h2" className="text-celestial-400">{selectedPlant.common_name}</Text.PageTitle>
                  <p className="text-sm text-earth-500 italic">{selectedPlant.latin_name}</p>
                </div>
                <Button.Ghost
                  route={`/plants/${selectedPlant.id}`}
                  className="text-xs"
                >
                  Full profile {'\u2192'}
                </Button.Ghost>
              </div>

              <p className="text-sm text-earth-300 mb-5 leading-relaxed">{selectedPlant.description}</p>

              {selectedPlant.compounds.filter((c) => c.psychoactive).length > 0 && (
                <div className="mb-5">
                  <Text.SectionLabel className="mb-2">Psychoactive Compounds</Text.SectionLabel>
                  <div className="space-y-2">
                    {selectedPlant.compounds
                      .filter((c) => c.psychoactive)
                      .map((compound) => (
                        <div key={compound.id} className="rounded-xl p-3"
                             style={{ background: 'rgba(26, 25, 21, 0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="text-sm text-celestial-300 font-medium">{compound.name}</div>
                          <div className="text-xs text-earth-500">{compound.compound_type}</div>
                          <p className="text-xs text-earth-400 mt-1 leading-relaxed">{compound.pharmacological_action}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedPlant.planetAssociations.length > 0 && (
                <div className="mb-5">
                  <Text.SectionLabel className="mb-2">Celestial Governance</Text.SectionLabel>
                  {selectedPlant.planetAssociations.map((assoc) => (
                    <div key={assoc.planet_id} className="flex items-center gap-3 mb-2 rounded-xl p-3"
                         style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="text-xl">{assoc.planet_symbol}</span>
                      <span className="text-earth-200">{assoc.planet_name}</span>
                      {assoc.notes && <span className="text-xs text-earth-500">- {assoc.notes}</span>}
                    </div>
                  ))}
                </div>
              )}

              {selectedPlant.ailmentAssociations.filter((a) => a.evidence_level === 'clinical').length > 0 && (
                <div className="mb-5">
                  <Text.SectionLabel className="mb-2">Clinical Evidence</Text.SectionLabel>
                  <div className="space-y-2">
                    {selectedPlant.ailmentAssociations
                      .filter((a) => a.evidence_level === 'clinical')
                      .map((assoc) => (
                        <div key={assoc.id} className="rounded-xl p-3"
                             style={{ background: 'rgba(61, 138, 94, 0.05)', border: '1px solid rgba(61, 138, 94, 0.1)' }}>
                          <div className="text-sm text-green-300">{assoc.ailment_name}</div>
                          <p className="text-xs text-earth-400 mt-1 leading-relaxed">{assoc.efficacy_notes}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedPlant.safety_notes && !selectedPlant.ethicalPractice && (
                <div className="rounded-xl p-4 mb-5"
                     style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400">{'\u26A0'}</span>
                    <span className="text-sm font-medium text-red-400">Safety & Contraindications</span>
                  </div>
                  <p className="text-xs text-earth-400 leading-relaxed">{selectedPlant.safety_notes}</p>
                </div>
              )}

              {selectedPlant.doctrine_of_signatures && (
                <div className="rounded-xl p-4"
                     style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Text.SectionLabel className="mb-1">Doctrine of Signatures</Text.SectionLabel>
                  <p className="text-xs text-earth-400 italic leading-relaxed">{selectedPlant.doctrine_of_signatures}</p>
                </div>
              )}

              {/* Ethical Practice Guide */}
              {selectedPlant.ethicalPractice && (
                <EthicalPracticePanel data={selectedPlant.ethicalPractice} />
              )}
            </div>
          )}

          {selectedProtocol && (
            <div className="card-glow-botanical animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl opacity-50">{selectedProtocol.icon}</span>
                <Text.PageTitle as="h2" className="text-botanical-400">{selectedProtocol.name}</Text.PageTitle>
              </div>
              <p className="text-sm text-earth-400 mb-6 leading-relaxed">{selectedProtocol.description}</p>

              <div className="space-y-0">
                {selectedProtocol.phases.map((phase, i) => (
                  <div key={i} className="relative pl-8 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {i < selectedProtocol.phases.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gradient-to-b from-botanical-700/50 to-botanical-700/10" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-botanical-600 bg-earth-950"
                         style={{ boxShadow: '0 0 8px rgba(93, 168, 126, 0.2)' }} />
                    <div className="text-xs text-botanical-500 mb-1 font-medium">{phase.duration}</div>
                    <Text.CardTitle as="h4" className="text-earth-200 mb-1.5">{phase.name}</Text.CardTitle>
                    <p className="text-xs text-earth-400 leading-relaxed">{phase.guidance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedPlant && !selectedProtocol && (
            <div className="card text-center py-16 text-earth-500">
              <div className="text-4xl mb-3 opacity-15 animate-pulse-slow">{'\u2604'}</div>
              <p className="text-lg font-display mb-2">Select a plant or protocol</p>
              <p className="text-sm">Choose an entheogenic plant to view its profile, or select a protocol for journey guidance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
