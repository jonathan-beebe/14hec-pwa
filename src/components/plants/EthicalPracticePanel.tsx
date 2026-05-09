import { useState } from 'react'
import type { EthicalPractice } from '../../types'
import Text from '@/components/design-system/atoms/Text'

type EthicalTab =
  | 'context'
  | 'facilitation'
  | 'safety'
  | 'sourcing'
  | 'preparation'
  | 'energetic'
  | 'integration'

const ETHICAL_TABS: { key: EthicalTab; label: string; icon: string }[] = [
  { key: 'context', label: 'Context & Ethics', icon: '⚖' },
  { key: 'facilitation', label: 'Facilitation', icon: '⭐' },
  { key: 'safety', label: 'Safety', icon: '⚠' },
  { key: 'sourcing', label: 'Sourcing', icon: '☘' },
  { key: 'preparation', label: 'Preparation', icon: '⚗' },
  { key: 'energetic', label: 'Energetic Signature', icon: '✨' },
  { key: 'integration', label: 'Integration', icon: '∞' },
]

export default function EthicalPracticePanel({ data }: { data: EthicalPractice }) {
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
                <span className="opacity-70">{item.level === 'strict' ? '✘' : '⚠'}</span>
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
