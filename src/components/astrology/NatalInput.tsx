import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { ZodiacSign, Plant } from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'

interface NatalProfile {
  sunSign: number | ''
  moonSign: number | ''
  risingSign: number | ''
}

interface PersonalizedResult {
  sign: ZodiacSign
  role: 'Sun' | 'Moon' | 'Rising'
  plants: (Plant & { association_notes?: string })[]
}

export default function NatalInput() {
  const navigate = useNavigate()
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [profile, setProfile] = useState<NatalProfile>({ sunSign: '', moonSign: '', risingSign: '' })
  const [results, setResults] = useState<PersonalizedResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    api.getZodiacSigns().then(setSigns)
  }, [])

  const generateMap = async () => {
    const newResults: PersonalizedResult[] = []

    const placements: { signId: number | ''; role: 'Sun' | 'Moon' | 'Rising' }[] = [
      { signId: profile.sunSign, role: 'Sun' },
      { signId: profile.moonSign, role: 'Moon' },
      { signId: profile.risingSign, role: 'Rising' }
    ]

    for (const placement of placements) {
      if (!placement.signId) continue
      const detail = await api.getZodiacSignById(placement.signId as number)
      if (detail) {
        newResults.push({
          sign: detail,
          role: placement.role,
          plants: (detail as any).plants || []
        })
      }
    }

    setResults(newResults)
    setHasSearched(true)
  }

  const roleDescriptions = {
    Sun: 'Core vitality, life force, and constitutional strength. Sun-aligned plants support your fundamental health pattern.',
    Moon: 'Emotional body, rhythms, and nurturing needs. Moon-aligned plants support your emotional and cyclical health.',
    Rising: 'Physical body, outward expression, and first impressions. Rising-aligned plants support your physical vessel and how you interface with the world.'
  }

  const roleConfig = {
    Sun: { color: 'amber', icon: '\u2609', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(16, 15, 12, 0.85))' },
    Moon: { color: 'blue', icon: '\u263D', gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 15, 12, 0.85))' },
    Rising: { color: 'rose', icon: '\u2191', gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(16, 15, 12, 0.85))' }
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-5">
        <Text.PageTitle>Astro-Botanical Chart</Text.PageTitle>
        <p className="text-xs text-earth-500 mt-0.5">
          Input your Sun, Moon, and Rising signs to generate a personalized plant map
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-5 mb-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { key: 'sunSign' as const, label: 'Sun Sign (Vitality)', color: 'text-amber-400', icon: '\u2609' },
            { key: 'moonSign' as const, label: 'Moon Sign (Emotions)', color: 'text-blue-300', icon: '\u263D' },
            { key: 'risingSign' as const, label: 'Rising Sign (Body)', color: 'text-rose-300', icon: '\u2191' }
          ].map((field) => (
            <div key={field.key}>
              <label className={`text-xs ${field.color} uppercase tracking-[0.15em] block mb-2 flex items-center gap-1.5`}>
                <span className="text-sm">{field.icon}</span> {field.label}
              </label>
              <select
                value={profile[field.key]}
                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value ? Number(e.target.value) : '' })}
                className="select-field w-full"
              >
                <option value="">Select sign...</option>
                {signs.map((s) => (
                  <option key={s.id} value={s.id}>{s.symbol} {s.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <Button.Celestial
          onClick={generateMap}
          disabled={!profile.sunSign && !profile.moonSign && !profile.risingSign}
        >
          Generate Plant Map
        </Button.Celestial>
      </div>

      {/* Results */}
      {hasSearched && results.length > 0 && (
        <div className="space-y-5 animate-fade-in-up">
          {results.map((result) => {
            const config = roleConfig[result.role]
            return (
              <div key={result.role} className="card-glow-celestial animate-fade-in"
                   style={{ background: config.gradient }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{result.sign.symbol}</span>
                  <div>
                    <Text.Subheading>
                      {config.icon} {result.role} in {result.sign.name}
                    </Text.Subheading>
                    <div className="flex gap-2 mt-1.5">
                      <span className={`badge badge-${result.sign.element}`}>{result.sign.element}</span>
                      <span className="badge bg-earth-800/50 text-earth-300 ring-1 ring-inset ring-earth-600/20">{result.sign.modality}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-earth-500 mb-4 italic leading-relaxed">{roleDescriptions[result.role]}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Text.SectionLabel>Body Areas</Text.SectionLabel>
                    <div className="text-sm text-earth-300">{result.sign.body_parts_ruled}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Text.SectionLabel>Ruling Planet</Text.SectionLabel>
                    <div className="text-sm text-earth-300">
                      {result.sign.ruling_planet_symbol} {result.sign.ruling_planet_name}
                    </div>
                  </div>
                </div>

                {result.plants.length > 0 ? (
                  <div>
                    <Text.SectionLabel className="mb-2">Aligned Plants</Text.SectionLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.plants.map((plant: any) => (
                        <button
                          key={plant.id}
                          onClick={() => navigate(`/plants/${plant.id}`)}
                          className="text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
                          style={{
                            background: 'rgba(36, 34, 30, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(36, 34, 30, 0.65)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(36, 34, 30, 0.4)' }}
                        >
                          <span className="text-botanical-400 font-medium group-hover:text-botanical-300 transition-colors">{plant.common_name}</span>
                          <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-earth-600 text-sm">No plants directly associated with this sign in the current database.</p>
                )}
              </div>
            )
          })}

          {/* Synthesis */}
          <div className="card-glow-celestial">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl opacity-50">{'\u2726'}</span>
              <Text.Subheading className="text-celestial-300">Chart Synthesis</Text.Subheading>
            </div>
            <p className="text-sm text-earth-400 leading-relaxed">
              Your unique combination of placements suggests attention to the body systems governed by your signs.
              Focus on plants that bridge these areas for holistic support. Use the Cross-Reference engine
              to find specific remedies for ailments related to your chart placements.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {results.map((r) => (
                <div key={r.role} className="rounded-xl px-3 py-2" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-xs text-earth-500">{r.role}:</span>
                  <span className="text-xs text-earth-300 ml-1">{r.sign.body_parts_ruled}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <div className="text-center py-16 text-earth-500">
          <div className="text-4xl mb-3 opacity-20">{'\u2B50'}</div>
          Select at least one placement to generate your plant map.
        </div>
      )}
    </div>
  )
}
