import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type {
  Ailment,
  ZodiacSign,
  PlanetData,
  Preparation,
  CrossRefResult,
  ContraindicationResult,
} from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'
import Select, { type SelectOption } from '@/components/design-system/atoms/Select'

const PART_OPTIONS: SelectOption[] = [
  { value: '', label: 'Any part' },
  { value: 'root', label: 'Root' },
  { value: 'bark', label: 'Bark' },
  { value: 'stem', label: 'Stem' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'flower', label: 'Flower' },
  { value: 'seed_fruit', label: 'Seed / Fruit' },
  { value: 'resin_sap', label: 'Resin / Sap' },
  { value: 'fungal_body', label: 'Fungal Body' },
  { value: 'whole', label: 'Whole' },
]

export default function CrossReference() {
  const navigate = useNavigate()
  const [ailments, setAilments] = useState<Ailment[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [preparations, setPreparations] = useState<Preparation[]>([])
  const [results, setResults] = useState<CrossRefResult[]>([])
  const [avoidResults, setAvoidResults] = useState<ContraindicationResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedAilment, setSelectedAilment] = useState('')
  const [selectedSign, setSelectedSign] = useState('')
  const [selectedPlanet, setSelectedPlanet] = useState('')
  const [selectedPart, setSelectedPart] = useState('')
  const [selectedPrep, setSelectedPrep] = useState('')

  useEffect(() => {
    Promise.all([
      api.getAilments(),
      api.getZodiacSigns(),
      api.getPlanets(),
      api.getPreparations(),
    ]).then(([a, z, p, pr]) => {
      setAilments(a)
      setSigns(z)
      setPlanets(p)
      setPreparations(pr)
    })
  }, [])

  const ailmentOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: 'Any ailment' },
      ...ailments.map((a) => ({ value: String(a.id), label: a.name })),
    ],
    [ailments],
  )

  const signOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: 'Any sign' },
      ...signs.map((s) => ({ value: String(s.id), label: `${s.symbol} ${s.name}` })),
    ],
    [signs],
  )

  const planetOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: 'Any planet' },
      ...planets.map((p) => ({ value: String(p.id), label: `${p.symbol} ${p.name}` })),
    ],
    [planets],
  )

  const prepOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: 'Any method' },
      ...preparations.map((p) => ({ value: String(p.id), label: p.name })),
    ],
    [preparations],
  )

  const runQuery = async () => {
    const params: Record<string, string | number> = {}
    if (selectedAilment) params.ailmentId = Number(selectedAilment)
    if (selectedSign) params.zodiacSignId = Number(selectedSign)
    if (selectedPlanet) params.planetId = selectedPlanet
    if (selectedPart) params.plantPart = selectedPart
    if (selectedPrep) params.preparationId = Number(selectedPrep)

    const contraindicationParams: Record<string, string | number> = {}
    if (selectedAilment) contraindicationParams.ailmentId = Number(selectedAilment)
    if (selectedSign) contraindicationParams.zodiacSignId = Number(selectedSign)
    if (selectedPlanet) contraindicationParams.planetId = selectedPlanet

    const [recResults, avoidRes] = await Promise.all([
      api.crossReference(params),
      api.crossReferenceContraindications(contraindicationParams),
    ])
    setResults(recResults)
    setAvoidResults(avoidRes)
    setHasSearched(true)
  }

  const clearAll = () => {
    setSelectedAilment('')
    setSelectedSign('')
    setSelectedPlanet('')
    setSelectedPart('')
    setSelectedPrep('')
    setResults([])
    setAvoidResults([])
    setHasSearched(false)
  }

  const hasAnyFilter =
    selectedAilment || selectedSign || selectedPlanet || selectedPart || selectedPrep

  const grouped = results.reduce<Record<number, CrossRefResult[]>>((acc, r) => {
    if (!acc[r.id]) acc[r.id] = []
    acc[r.id].push(r)
    return acc
  }, {})

  const avoidGrouped = avoidResults.reduce<Record<number, ContraindicationResult[]>>(
    (acc, r) => {
      if (!acc[r.id]) acc[r.id] = []
      acc[r.id].push(r)
      return acc
    },
    {},
  )

  return (
    <div className="animate-fade-in lg:h-full lg:flex">
      {/* Filter sidebar */}
      <aside className="shrink-0 border-b border-white/5 lg:w-[30%] lg:max-w-[360px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="p-4 md:p-6 space-y-5">
          <div>
            <Text.PageTitle>Cross-Reference Engine</Text.PageTitle>
            <p className="text-sm text-earth-500 mt-1">
              Enter from any axis to discover plant correspondences
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Text.SectionLabel as="label" className="block mb-1.5">
                Ailment / Condition
              </Text.SectionLabel>
              <Select
                fullWidth
                label="Ailment"
                options={ailmentOptions}
                value={selectedAilment}
                onChange={setSelectedAilment}
              />
            </div>

            <div>
              <Text.SectionLabel as="label" className="block mb-1.5">
                Zodiac Sign
              </Text.SectionLabel>
              <Select
                fullWidth
                label="Zodiac sign"
                options={signOptions}
                value={selectedSign}
                onChange={setSelectedSign}
              />
            </div>

            <div>
              <Text.SectionLabel as="label" className="block mb-1.5">
                Ruling Planet
              </Text.SectionLabel>
              <Select
                fullWidth
                label="Planet"
                options={planetOptions}
                value={selectedPlanet}
                onChange={setSelectedPlanet}
              />
            </div>

            <div>
              <Text.SectionLabel as="label" className="block mb-1.5">
                Plant Part
              </Text.SectionLabel>
              <Select
                fullWidth
                label="Plant part"
                options={PART_OPTIONS}
                value={selectedPart}
                onChange={setSelectedPart}
              />
            </div>

            <div>
              <Text.SectionLabel as="label" className="block mb-1.5">
                Preparation Method
              </Text.SectionLabel>
              <Select
                fullWidth
                label="Preparation"
                options={prepOptions}
                value={selectedPrep}
                onChange={setSelectedPrep}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button.Primary onClick={runQuery} disabled={!hasAnyFilter}>
              Search
            </Button.Primary>
            {hasAnyFilter && (
              <Button.Ghost onClick={clearAll}>Clear all</Button.Ghost>
            )}
          </div>
        </div>
      </aside>

      {/* Results */}
      <section className="flex-1 lg:overflow-y-auto p-4 md:p-6">
        {hasSearched ? (
          <div className="animate-fade-in-up max-w-4xl">
            <p className="text-[10px] text-earth-600/60 mb-3 leading-relaxed">
              Information reflects traditional ethnobotanical knowledge and is for
              educational purposes only. Consult a qualified healthcare provider
              before using any herbal substance.
            </p>

            {/* Recommended Plants */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-botanical-500">{'☘'}</span>
              <Text.Subheading as="h2" className="text-earth-200">
                Recommended Plants
              </Text.Subheading>
              <span className="text-sm text-earth-500">
                {Object.keys(grouped).length} found
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(grouped).map(([plantId, items]) => {
                const first = items[0]
                return (
                  <div key={plantId} className="card">
                    <div className="flex justify-between items-start mb-3">
                      <button
                        onClick={() => navigate(`/plants/${Number(plantId)}`)}
                        className="text-lg font-display font-semibold text-botanical-400 hover:text-botanical-300 transition-colors"
                      >
                        {first.common_name}
                      </button>
                      <span className={`badge badge-${first.category}`}>
                        {first.category}
                      </span>
                    </div>
                    <p className="text-sm text-earth-500 italic mb-3">
                      {first.latin_name}
                    </p>
                    {first.energetic_quality && (
                      <p className="text-xs text-celestial-400/60 mb-3">
                        {first.energetic_quality}
                      </p>
                    )}

                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-3 flex items-center gap-3 text-sm"
                          style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                        >
                          <span className="text-earth-300">
                            {item.ailment_name}
                          </span>
                          <span className="text-botanical-700">{'→'}</span>
                          {item.part_type && (
                            <span className="text-earth-400 capitalize">
                              {item.part_type.replace('_', ' ')}
                            </span>
                          )}
                          {item.preparation_name && (
                            <>
                              <span className="text-earth-600">as</span>
                              <span className="text-earth-400">
                                {item.preparation_name}
                              </span>
                            </>
                          )}
                          <span
                            className={`ml-auto evidence-badge evidence-${item.evidence_level}`}
                          >
                            {item.evidence_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-8 text-earth-500">
                No recommended plants found for this combination.
              </div>
            )}

            {/* Plants to Avoid */}
            {Object.keys(avoidGrouped).length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-400">{'⚠'}</span>
                  <Text.Subheading as="h2" className="text-red-300">
                    Plants to Avoid
                  </Text.Subheading>
                  <span className="text-sm text-earth-500">
                    {Object.keys(avoidGrouped).length} found
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(avoidGrouped).map(([plantId, items]) => {
                    const first = items[0]
                    return (
                      <div
                        key={plantId}
                        className="card"
                        style={{
                          background: 'rgba(220, 38, 38, 0.04)',
                          borderColor: 'rgba(220, 38, 38, 0.12)',
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <button
                            onClick={() =>
                              navigate(`/plants/${Number(plantId)}`)
                            }
                            className="text-lg font-display font-semibold text-red-300 hover:text-red-200 transition-colors"
                          >
                            {first.common_name}
                          </button>
                          <span className={`badge badge-${first.category}`}>
                            {first.category}
                          </span>
                        </div>
                        <p className="text-sm text-earth-500 italic mb-3">
                          {first.latin_name}
                        </p>

                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div
                              key={i}
                              className="rounded-xl p-3 text-sm"
                              style={{
                                background: 'rgba(220, 38, 38, 0.03)',
                              }}
                            >
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-earth-300">
                                  {item.ailment_name}
                                </span>
                                <span
                                  className={`ml-auto badge ${
                                    item.severity === 'high'
                                      ? 'bg-red-500/10 text-red-300 ring-red-500/20'
                                      : item.severity === 'moderate'
                                        ? 'bg-amber-500/10 text-amber-300 ring-amber-500/20'
                                        : 'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20'
                                  }`}
                                >
                                  {item.severity}
                                </span>
                              </div>
                              {item.reason && (
                                <p className="text-xs text-earth-400 mt-1">
                                  {item.reason}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-earth-500 mt-1 italic">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {Object.keys(grouped).length === 0 &&
              Object.keys(avoidGrouped).length === 0 && (
                <div className="text-center py-16 text-earth-500">
                  <div className="text-4xl mb-3 opacity-20">{'⧖'}</div>
                  No matching plants found. Try broadening your search criteria.
                </div>
              )}
          </div>
        ) : (
          <div className="flex items-center justify-center lg:h-full min-h-[200px] text-earth-600">
            <div className="text-center py-16 lg:py-0">
              <div className="text-5xl mb-4 opacity-15 animate-pulse-slow">
                {'⧖'}
              </div>
              <p className="text-lg font-display mb-2">
                Select at least one filter and click Search
              </p>
              <p className="text-sm">
                Try: &ldquo;Anxiety&rdquo; + &ldquo;Pisces&rdquo; to find
                aligned plant remedies
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
