import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { Ailment, ZodiacSign, PlanetData, Preparation, CrossRefResult, ContraindicationResult } from '../../types'
import Button from '@/components/design-system/atoms/Button'

export default function CrossReference() {
  const navigate = useNavigate()
  const [ailments, setAilments] = useState<Ailment[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [preparations, setPreparations] = useState<Preparation[]>([])
  const [results, setResults] = useState<CrossRefResult[]>([])
  const [avoidResults, setAvoidResults] = useState<ContraindicationResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedAilment, setSelectedAilment] = useState<number | ''>('')
  const [selectedSign, setSelectedSign] = useState<number | ''>('')
  const [selectedPlanet, setSelectedPlanet] = useState<string>('')
  const [selectedPart, setSelectedPart] = useState('')
  const [selectedPrep, setSelectedPrep] = useState<number | ''>('')

  useEffect(() => {
    Promise.all([
      api.getAilments(),
      api.getZodiacSigns(),
      api.getPlanets(),
      api.getPreparations()
    ]).then(([a, z, p, pr]) => {
      setAilments(a)
      setSigns(z)
      setPlanets(p)
      setPreparations(pr)
    })
  }, [])

  const runQuery = async () => {
    const params: any = {}
    if (selectedAilment) params.ailmentId = selectedAilment
    if (selectedSign) params.zodiacSignId = selectedSign
    if (selectedPlanet) params.planetId = selectedPlanet
    if (selectedPart) params.plantPart = selectedPart
    if (selectedPrep) params.preparationId = selectedPrep

    const contraindicationParams: any = {}
    if (selectedAilment) contraindicationParams.ailmentId = selectedAilment
    if (selectedSign) contraindicationParams.zodiacSignId = selectedSign
    if (selectedPlanet) contraindicationParams.planetId = selectedPlanet

    const [recResults, avoidRes] = await Promise.all([
      api.crossReference(params),
      api.crossReferenceContraindications(contraindicationParams)
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

  const hasAnyFilter = selectedAilment || selectedSign || selectedPlanet || selectedPart || selectedPrep

  const grouped = results.reduce<Record<number, CrossRefResult[]>>((acc, r) => {
    if (!acc[r.id]) acc[r.id] = []
    acc[r.id].push(r)
    return acc
  }, {})

  const avoidGrouped = avoidResults.reduce<Record<number, ContraindicationResult[]>>((acc, r) => {
    if (!acc[r.id]) acc[r.id] = []
    acc[r.id].push(r)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-display font-bold text-earth-100">Cross-Reference Engine</h1>
        <p className="text-sm text-earth-500">Enter from any axis to discover plant correspondences</p>
      </div>

      {/* Query Builder */}
      <div className="glass-panel p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="section-subtitle block mb-1.5">Ailment / Condition</label>
            <select
              value={selectedAilment}
              onChange={(e) => setSelectedAilment(e.target.value ? Number(e.target.value) : '')}
              className="select-field w-full"
            >
              <option value="">Any ailment</option>
              {ailments.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-subtitle block mb-1.5">Zodiac Sign</label>
            <select
              value={selectedSign}
              onChange={(e) => setSelectedSign(e.target.value ? Number(e.target.value) : '')}
              className="select-field w-full"
            >
              <option value="">Any sign</option>
              {signs.map((s) => (
                <option key={s.id} value={s.id}>{s.symbol} {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-subtitle block mb-1.5">Ruling Planet</label>
            <select
              value={selectedPlanet}
              onChange={(e) => setSelectedPlanet(e.target.value)}
              className="select-field w-full"
            >
              <option value="">Any planet</option>
              {planets.map((p) => (
                <option key={p.id} value={p.id}>{p.symbol} {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-subtitle block mb-1.5">Plant Part</label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="select-field w-full"
            >
              <option value="">Any part</option>
              <option value="root">Root</option>
              <option value="bark">Bark</option>
              <option value="stem">Stem</option>
              <option value="leaf">Leaf</option>
              <option value="flower">Flower</option>
              <option value="seed_fruit">Seed / Fruit</option>
              <option value="resin_sap">Resin / Sap</option>
              <option value="fungal_body">Fungal Body</option>
              <option value="whole">Whole</option>
            </select>
          </div>

          <div>
            <label className="section-subtitle block mb-1.5">Preparation Method</label>
            <select
              value={selectedPrep}
              onChange={(e) => setSelectedPrep(e.target.value ? Number(e.target.value) : '')}
              className="select-field w-full"
            >
              <option value="">Any method</option>
              {preparations.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button.Primary onClick={runQuery} disabled={!hasAnyFilter}>
            Search Correspondences
          </Button.Primary>
          {hasAnyFilter && (
            <Button.Ghost onClick={clearAll}>
              Clear all
            </Button.Ghost>
          )}
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="animate-fade-in-up">
          {/* Inline disclaimer */}
          <p className="text-[10px] text-earth-600/60 mb-3 leading-relaxed">
            Information reflects traditional ethnobotanical knowledge and is for educational purposes only.
            Consult a qualified healthcare provider before using any herbal substance.
          </p>

          {/* Recommended Plants */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-botanical-500">{'\u2618'}</span>
            <h2 className="text-lg font-display font-semibold text-earth-200">Recommended Plants</h2>
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
                    <span className={`badge badge-${first.category}`}>{first.category}</span>
                  </div>
                  <p className="text-sm text-earth-500 italic mb-3">{first.latin_name}</p>
                  {first.energetic_quality && (
                    <p className="text-xs text-celestial-400/60 mb-3">{first.energetic_quality}</p>
                  )}

                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="rounded-xl p-3 flex items-center gap-3 text-sm"
                           style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                        <span className="text-earth-300">{item.ailment_name}</span>
                        <span className="text-botanical-700">{'\u2192'}</span>
                        {item.part_type && (
                          <span className="text-earth-400 capitalize">{item.part_type.replace('_', ' ')}</span>
                        )}
                        {item.preparation_name && (
                          <>
                            <span className="text-earth-600">as</span>
                            <span className="text-earth-400">{item.preparation_name}</span>
                          </>
                        )}
                        <span className={`ml-auto evidence-badge evidence-${item.evidence_level}`}>
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
                <span className="text-red-400">{'\u26A0'}</span>
                <h2 className="text-lg font-display font-semibold text-red-300">Plants to Avoid</h2>
                <span className="text-sm text-earth-500">
                  {Object.keys(avoidGrouped).length} found
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(avoidGrouped).map(([plantId, items]) => {
                  const first = items[0]
                  return (
                    <div key={plantId} className="card"
                         style={{
                           background: 'rgba(220, 38, 38, 0.04)',
                           borderColor: 'rgba(220, 38, 38, 0.12)'
                         }}>
                      <div className="flex justify-between items-start mb-3">
                        <button
                          onClick={() => navigate(`/plants/${Number(plantId)}`)}
                          className="text-lg font-display font-semibold text-red-300 hover:text-red-200 transition-colors"
                        >
                          {first.common_name}
                        </button>
                        <span className={`badge badge-${first.category}`}>{first.category}</span>
                      </div>
                      <p className="text-sm text-earth-500 italic mb-3">{first.latin_name}</p>

                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <div key={i} className="rounded-xl p-3 text-sm"
                               style={{ background: 'rgba(220, 38, 38, 0.03)' }}>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-earth-300">{item.ailment_name}</span>
                              <span className={`ml-auto badge ${
                                item.severity === 'high'
                                  ? 'bg-red-500/10 text-red-300 ring-red-500/20'
                                  : item.severity === 'moderate'
                                  ? 'bg-amber-500/10 text-amber-300 ring-amber-500/20'
                                  : 'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20'
                              }`}>
                                {item.severity}
                              </span>
                            </div>
                            {item.reason && (
                              <p className="text-xs text-earth-400 mt-1">{item.reason}</p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-earth-500 mt-1 italic">{item.notes}</p>
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

          {Object.keys(grouped).length === 0 && Object.keys(avoidGrouped).length === 0 && (
            <div className="text-center py-16 text-earth-500">
              <div className="text-4xl mb-3 opacity-20">{'\u29D6'}</div>
              No matching plants found. Try broadening your search criteria.
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-16 text-earth-600">
          <div className="text-5xl mb-4 opacity-15 animate-pulse-slow">{'\u29D6'}</div>
          <p className="text-lg font-display mb-2">Select at least one filter and click Search</p>
          <p className="text-sm">Try: "Anxiety" + "Pisces" to find aligned plant remedies</p>
        </div>
      )}
    </div>
  )
}
