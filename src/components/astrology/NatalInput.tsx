import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { ZodiacSign, Plant } from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'
import Select, { type SelectOption } from '@/components/design-system/atoms/Select'
import {
  computeAvailableSigns,
  validateSelections,
  EMPTY_SELECTIONS,
  type NatalDataset,
  type NatalSelections,
} from './natal-engine'

interface PersonalizedResult {
  sign: ZodiacSign
  role: 'Sun' | 'Moon' | 'Rising'
  plants: (Plant & { association_notes?: string })[]
}

const ROLE_CONFIG = {
  Sun: { color: 'text-amber-400', icon: '☉', label: 'Sun Sign (Vitality)', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(16, 15, 12, 0.85))' },
  Moon: { color: 'text-blue-300', icon: '☽', label: 'Moon Sign (Emotions)', gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 15, 12, 0.85))' },
  Rising: { color: 'text-rose-300', icon: '↑', label: 'Rising Sign (Body)', gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(16, 15, 12, 0.85))' },
} as const

const ROLE_DESCRIPTIONS = {
  Sun: 'Core vitality, life force, and constitutional strength. Sun-aligned plants support your fundamental health pattern.',
  Moon: 'Emotional body, rhythms, and nurturing needs. Moon-aligned plants support your emotional and cyclical health.',
  Rising: 'Physical body, outward expression, and first impressions. Rising-aligned plants support your physical vessel and how you interface with the world.',
} as const

const EMPTY_DATASET: NatalDataset = { signsWithPlants: new Set() }

export default function NatalInput() {
  const navigate = useNavigate()
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [dataset, setDataset] = useState<NatalDataset>(EMPTY_DATASET)
  const [selections, setSelections] = useState<NatalSelections>(EMPTY_SELECTIONS)
  const [results, setResults] = useState<PersonalizedResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    Promise.all([api.getZodiacSigns(), api.getNatalDataset()]).then(
      ([s, ds]) => {
        setSigns(s)
        setDataset(ds)
      },
    )
  }, [])

  const available = useMemo(() => computeAvailableSigns(dataset), [dataset])

  function updateSelection(key: keyof NatalSelections, value: number | null) {
    setSelections((prev) => {
      const next = { ...prev, [key]: value }
      return validateSelections(available, next)
    })
  }

  const signOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: 'Select sign…' },
      ...signs.map((s) => ({
        value: String(s.id),
        label: `${s.symbol} ${s.name}`,
        disabled: !available.has(s.id),
      })),
    ],
    [signs, available],
  )

  const toStr = (v: number | null) => (v === null ? '' : String(v))
  const toNum = (s: string) => (s === '' ? null : Number(s))

  const generateMap = async () => {
    const placements: { signId: number | null; role: 'Sun' | 'Moon' | 'Rising' }[] = [
      { signId: selections.sun, role: 'Sun' },
      { signId: selections.moon, role: 'Moon' },
      { signId: selections.rising, role: 'Rising' },
    ]

    const newResults: PersonalizedResult[] = []
    for (const placement of placements) {
      if (placement.signId === null) continue
      const detail = await api.getZodiacSignById(placement.signId)
      if (detail) {
        newResults.push({
          sign: detail,
          role: placement.role,
          plants: (detail as any).plants || [],
        })
      }
    }

    setResults(newResults)
    setHasSearched(true)
  }

  const clearAll = () => {
    setSelections(EMPTY_SELECTIONS)
    setResults([])
    setHasSearched(false)
  }

  const hasAnySelection =
    selections.sun !== null ||
    selections.moon !== null ||
    selections.rising !== null

  return (
    <div className="animate-fade-in lg:h-full lg:flex">
      {/* Filter sidebar */}
      <aside className="shrink-0 border-b border-white/5 lg:w-[30%] lg:max-w-[360px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="p-4 md:p-6 space-y-5">
          <div>
            <Text.PageTitle>Astro-Botanical Chart</Text.PageTitle>
            <p className="text-sm text-earth-500 mt-1">
              Input your Sun, Moon, and Rising signs to generate a personalized
              plant map
            </p>
          </div>

          <div className="space-y-3">
            {(['sun', 'moon', 'rising'] as const).map((key) => {
              const role = key === 'sun' ? 'Sun' : key === 'moon' ? 'Moon' : 'Rising'
              const config = ROLE_CONFIG[role]
              return (
                <div key={key}>
                  <Text.SectionLabel as="label" className={`block mb-1.5 ${config.color}`}>
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </Text.SectionLabel>
                  <Select
                    fullWidth
                    label={config.label}
                    options={signOptions}
                    value={toStr(selections[key])}
                    onChange={(v) => updateSelection(key, toNum(v))}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex gap-2">
            <Button.Celestial onClick={generateMap} disabled={!hasAnySelection}>
              Generate Plant Map
            </Button.Celestial>
            {hasAnySelection && (
              <Button.Ghost onClick={clearAll}>Clear</Button.Ghost>
            )}
          </div>
        </div>
      </aside>

      {/* Results panel */}
      <section className="min-w-0 flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {hasSearched && results.length > 0 && (
            <div className="space-y-5 animate-fade-in-up">
              {results.map((result) => {
                const config = ROLE_CONFIG[result.role]
                return (
                  <div
                    key={result.role}
                    className="card-glow-celestial animate-fade-in"
                    style={{ background: config.gradient }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{result.sign.symbol}</span>
                      <div>
                        <Text.Subheading>
                          {config.icon} {result.role} in {result.sign.name}
                        </Text.Subheading>
                        <div className="flex gap-2 mt-1.5">
                          <span className={`badge badge-${result.sign.element}`}>
                            {result.sign.element}
                          </span>
                          <span className="badge bg-earth-800/50 text-earth-300 ring-1 ring-inset ring-earth-600/20">
                            {result.sign.modality}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-earth-500 mb-4 italic leading-relaxed">
                      {ROLE_DESCRIPTIONS[result.role]}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(36, 34, 30, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <Text.SectionLabel>Body Areas</Text.SectionLabel>
                        <div className="text-sm text-earth-300">
                          {result.sign.body_parts_ruled}
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(36, 34, 30, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <Text.SectionLabel>Ruling Planet</Text.SectionLabel>
                        <div className="text-sm text-earth-300">
                          {result.sign.ruling_planet_symbol}{' '}
                          {result.sign.ruling_planet_name}
                        </div>
                      </div>
                    </div>

                    {result.plants.length > 0 ? (
                      <div>
                        <Text.SectionLabel className="mb-2">
                          Aligned Plants
                        </Text.SectionLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.plants.map((plant: any) => (
                            <button
                              key={plant.id}
                              onClick={() => navigate(`/plants/${plant.id}`)}
                              className="text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group hover:bg-earth-800/60"
                              style={{
                                background: 'rgba(36, 34, 30, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <span className="text-botanical-400 font-medium group-hover:text-botanical-300 transition-colors">
                                {plant.common_name}
                              </span>
                              <span className="text-earth-500 text-xs ml-2 italic">
                                {plant.latin_name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-earth-600 text-sm">
                        No plants directly associated with this sign in the
                        current database.
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Synthesis */}
              <div className="card-glow-celestial">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl opacity-50">{'✦'}</span>
                  <Text.Subheading className="text-celestial-300">
                    Chart Synthesis
                  </Text.Subheading>
                </div>
                <p className="text-sm text-earth-400 leading-relaxed">
                  Your unique combination of placements suggests attention to the
                  body systems governed by your signs. Focus on plants that
                  bridge these areas for holistic support. Use the Cross-Reference
                  engine to find specific remedies for ailments related to your
                  chart placements.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {results.map((r) => (
                    <div
                      key={r.role}
                      className="rounded-xl px-3 py-2"
                      style={{
                        background: 'rgba(36, 34, 30, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <span className="text-xs text-earth-500">{r.role}:</span>
                      <span className="text-xs text-earth-300 ml-1">
                        {r.sign.body_parts_ruled}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasSearched && results.length === 0 && (
            <div className="text-center py-16 text-earth-500">
              <div className="text-4xl mb-3 opacity-20">{'⭐'}</div>
              Select at least one placement to generate your plant map.
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-16 text-earth-500">
              <div className="text-4xl mb-3 opacity-20">{'✦'}</div>
              Choose your placements and generate a personalized plant map.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
