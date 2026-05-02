import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { ZodiacSign, PlanetData, Plant } from '../../types'
import Button from '@/components/design-system/atoms/Button'

export default function AstrologyView() {
  const navigate = useNavigate()
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [selectedSign, setSelectedSign] = useState<(ZodiacSign & { plants?: Plant[]; ailments?: any[] }) | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<(PlanetData & { plants?: Plant[] }) | null>(null)
  const [tab, setTab] = useState<'zodiac' | 'planets'>('zodiac')

  useEffect(() => {
    api.getZodiacSigns().then(setSigns)
    api.getPlanets().then(setPlanets)
  }, [])

  const loadSignDetail = async (signId: number) => {
    const detail = await api.getZodiacSignById(signId)
    setSelectedSign(detail)
    setSelectedPlanet(null)
  }

  const loadPlanetDetail = async (planetId: number) => {
    const detail = await api.getPlanetById(planetId)
    setSelectedPlanet(detail)
    setSelectedSign(null)
  }

  const elementBadgeColors: Record<string, string> = {
    fire: 'bg-red-500/10 text-red-300 ring-red-500/20',
    water: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    air: 'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20',
    earth: 'bg-green-500/10 text-green-300 ring-green-500/20'
  }

  const elementCardColors: Record<string, string> = {
    fire: 'border-red-500/15 shadow-[inset_0_1px_0_0_rgba(239,68,68,0.06),0_0_1px_rgba(239,68,68,0.2),0_4px_24px_-4px_rgba(0,0,0,0.3)]',
    water: 'border-blue-500/15 shadow-[inset_0_1px_0_0_rgba(59,130,246,0.06),0_0_1px_rgba(59,130,246,0.2),0_4px_24px_-4px_rgba(0,0,0,0.3)]',
    air: 'border-yellow-500/15 shadow-[inset_0_1px_0_0_rgba(234,179,8,0.06),0_0_1px_rgba(234,179,8,0.2),0_4px_24px_-4px_rgba(0,0,0,0.3)]',
    earth: 'border-green-500/15 shadow-[inset_0_1px_0_0_rgba(61,138,94,0.06),0_0_1px_rgba(61,138,94,0.2),0_4px_24px_-4px_rgba(0,0,0,0.3)]'
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-earth-100">Astrology</h1>
        <p className="text-xs text-earth-500 mt-0.5">Celestial correspondences for plant medicine</p>
      </div>

      {/* Quick Links to Phase 2 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => navigate('/natal-chart')}
          className="card-glow-celestial text-left py-4 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-200 ease-out-expo">{'\u2B50'}</span>
            <div>
              <div className="text-sm font-display font-medium text-celestial-400">Astro-Botanical Chart</div>
              <div className="text-xs text-earth-500">Input Sun/Moon/Rising for a personalized plant map</div>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate('/planetary-timing')}
          className="card-glow-celestial text-left py-4 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-200 ease-out-expo">{'\u231A'}</span>
            <div>
              <div className="text-sm font-display font-medium text-celestial-400">Planetary Timing</div>
              <div className="text-xs text-earth-500">Optimal hours for harvesting and preparation</div>
            </div>
          </div>
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-5">
        {(['zodiac', 'planets'] as const).map((t) => (
          <Button.Celestial
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? ''
                : '!bg-none !shadow-none bg-earth-800/40 !text-earth-400 hover:!text-earth-200'
            }
          >
            {t === 'zodiac' ? 'Zodiac Signs' : 'Planets'}
          </Button.Celestial>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Sign/Planet List */}
        <div className="lg:col-span-1">
          {tab === 'zodiac' ? (
            <div className="grid grid-cols-3 gap-3">
              {signs.map((sign) => (
                <button
                  key={sign.id}
                  onClick={() => loadSignDetail(sign.id)}
                  className={`card-glow-celestial text-center transition-all duration-200 ease-out-expo !p-3 ${
                    selectedSign?.id === sign.id
                      ? elementCardColors[sign.element]
                      : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{sign.symbol}</div>
                  <div className="text-xs text-earth-300">{sign.name}</div>
                  <div className="mt-1">
                    <span className={`badge text-[10px] !px-1.5 !py-0 capitalize ${elementBadgeColors[sign.element] || ''}`}>
                      {sign.element}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {planets.map((planet) => (
                <button
                  key={planet.id}
                  onClick={() => loadPlanetDetail(planet.id)}
                  className={`card-glow-celestial w-full text-left !p-4 transition-all duration-200 ease-out-expo ${
                    selectedPlanet?.id === planet.id
                      ? 'border-celestial-700/40'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl opacity-70">{planet.symbol}</span>
                    <div>
                      <div className="text-sm text-earth-200">{planet.name}</div>
                      <div className="text-xs text-earth-500">{planet.associated_signs}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedSign && (
            <div className="card-glow-celestial animate-fade-in">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-5xl">{selectedSign.symbol}</span>
                <div>
                  <h2 className="text-xl font-display font-bold text-earth-100">{selectedSign.name}</h2>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`badge badge-${selectedSign.element}`}>{selectedSign.element}</span>
                    <span className="badge bg-earth-800/50 text-earth-300 ring-1 ring-inset ring-earth-600/20">{selectedSign.modality}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="section-subtitle">Ruling Planet</div>
                  <div className="text-earth-200">
                    {selectedSign.ruling_planet_symbol} {selectedSign.ruling_planet_name}
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="section-subtitle">Date Range</div>
                  <div className="text-earth-200">{selectedSign.date_range_start} to {selectedSign.date_range_end}</div>
                </div>
                <div className="col-span-2 rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="section-subtitle">Body Parts Ruled</div>
                  <div className="text-earth-200 text-sm">{selectedSign.body_parts_ruled}</div>
                </div>
              </div>

              <p className="text-sm text-earth-400 mb-5 leading-relaxed">{selectedSign.description}</p>

              {selectedSign.plants && selectedSign.plants.length > 0 && (
                <div>
                  <div className="section-subtitle">Associated Plants</div>
                  <div className="space-y-2">
                    {selectedSign.plants.map((plant: any) => (
                      <button
                        key={plant.id}
                        onClick={() => navigate(`/plants/${plant.id}`)}
                        className="w-full text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
                        style={{
                          background: 'rgba(36, 34, 30, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(36, 34, 30, 0.65)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(36, 34, 30, 0.4)' }}
                      >
                        <span className="text-botanical-400 group-hover:text-botanical-300 transition-colors">{plant.common_name}</span>
                        <span className="text-earth-500 text-sm ml-2 italic">{plant.latin_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedPlanet && (
            <div className="card-glow-celestial animate-fade-in">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-5xl">{selectedPlanet.symbol}</span>
                <div>
                  <h2 className="text-xl font-display font-bold text-earth-100">{selectedPlanet.name}</h2>
                  <p className="text-sm text-earth-500">{selectedPlanet.associated_signs}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="section-subtitle">Body Systems</div>
                  <div className="text-earth-200 text-sm">{selectedPlanet.body_systems}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="section-subtitle">Energetic Quality</div>
                  <div className="text-earth-200 text-sm">{selectedPlanet.energetic_quality}</div>
                </div>
              </div>

              <p className="text-sm text-earth-400 mb-5 leading-relaxed">{selectedPlanet.description}</p>

              {selectedPlanet.plants && selectedPlanet.plants.length > 0 && (
                <div>
                  <div className="section-subtitle">Ruled Plants</div>
                  <div className="space-y-2">
                    {selectedPlanet.plants.map((plant: any) => (
                      <button
                        key={plant.id}
                        onClick={() => navigate(`/plants/${plant.id}`)}
                        className="w-full text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
                        style={{
                          background: 'rgba(36, 34, 30, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(36, 34, 30, 0.65)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(36, 34, 30, 0.4)' }}
                      >
                        <span className="text-botanical-400 group-hover:text-botanical-300 transition-colors">{plant.common_name}</span>
                        <span className="text-earth-500 text-sm ml-2 italic">{plant.latin_name}</span>
                        <span className="text-xs text-earth-600 ml-2">({plant.association_type?.replace('_', ' ')})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedSign && !selectedPlanet && (
            <div className="card text-center py-16 text-earth-500">
              <div className="text-4xl mb-3 opacity-20">{'\u2609'}</div>
              Select a zodiac sign or planet to view its correspondences
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
