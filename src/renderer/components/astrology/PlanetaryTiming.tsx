import { useState, useEffect } from 'react'
import type { PlanetData, Plant } from '../../types'

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

function getDayRuler(date: Date): string {
  return DAY_RULERS[date.getDay()]
}

function getPlanetaryHour(date: Date): { planet: string; hourNumber: number } {
  const dayRuler = getDayRuler(date)
  const startIdx = CHALDEAN_ORDER.indexOf(dayRuler)
  const hour = date.getHours()
  const sunriseHour = 6
  const isDaytime = hour >= sunriseHour && hour < sunriseHour + 12
  const hoursSinceSunrise = isDaytime
    ? hour - sunriseHour
    : (hour >= sunriseHour + 12 ? hour - sunriseHour - 12 : hour + 24 - sunriseHour - 12)
  const planetaryHourIndex = (startIdx + (isDaytime ? hoursSinceSunrise : hoursSinceSunrise + 12)) % 7
  return { planet: CHALDEAN_ORDER[planetaryHourIndex], hourNumber: hoursSinceSunrise + 1 }
}

function getOptimalActivities(planetName: string): string[] {
  const activities: Record<string, string[]> = {
    Sun: ['Harvesting solar herbs (rosemary, St. John\'s Wort)', 'Preparing vitalizing tonics', 'Setting intentions for healing'],
    Moon: ['Harvesting lunar herbs (mugwort, jasmine)', 'Making flower essences', 'Dream work preparations', 'Planting by moonlight'],
    Mercury: ['Studying herbal properties', 'Blending tinctures', 'Communication about healing', 'Preparing nervine herbs'],
    Venus: ['Harvesting flowers for beauty preparations', 'Making rose water', 'Preparing love and harmony elixirs'],
    Mars: ['Harvesting roots and protective herbs', 'Making stimulating preparations', 'Physical cleansing rituals'],
    Jupiter: ['Expanding herbal knowledge', 'Making liver tonics', 'Generous giving of medicine', 'Planting for abundance'],
    Saturn: ['Harvesting bark and structural herbs', 'Making long-term tinctures', 'Bone and joint preparations', 'Grounding practices']
  }
  return activities[planetName] || []
}

export default function PlanetaryTiming() {
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedPlanetPlants, setSelectedPlanetPlants] = useState<Plant[]>([])
  const [selectedPlanetName, setSelectedPlanetName] = useState('')

  useEffect(() => {
    window.api.getPlanets().then(setPlanets)
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const dayRuler = getDayRuler(currentTime)
  const currentPlanetaryHour = getPlanetaryHour(currentTime)

  const loadPlanetPlants = async (planetName: string) => {
    const planet = planets.find((p) => p.name === planetName)
    if (planet) {
      const detail = await window.api.getPlanetById(planet.id)
      setSelectedPlanetPlants(detail?.plants || [])
      setSelectedPlanetName(planetName)
    }
  }

  const todayHours = Array.from({ length: 24 }, (_, i) => {
    const hourDate = new Date(currentTime)
    hourDate.setHours(6 + i, 0, 0, 0)
    if (hourDate.getHours() >= 24) hourDate.setDate(hourDate.getDate() + 1)
    return {
      hour: (6 + i) % 24,
      ...getPlanetaryHour(hourDate),
      isCurrent: currentTime.getHours() === (6 + i) % 24
    }
  })

  const planetSymbols: Record<string, string> = {
    Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
    Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644'
  }

  const planetGradients: Record<string, string> = {
    Sun: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 15, 12, 0.85))',
    Moon: 'linear-gradient(135deg, rgba(147, 197, 253, 0.08), rgba(16, 15, 12, 0.85))',
    Mercury: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(16, 15, 12, 0.85))',
    Venus: 'linear-gradient(135deg, rgba(244, 114, 182, 0.08), rgba(16, 15, 12, 0.85))',
    Mars: 'linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(16, 15, 12, 0.85))',
    Jupiter: 'linear-gradient(135deg, rgba(196, 181, 253, 0.08), rgba(16, 15, 12, 0.85))',
    Saturn: 'linear-gradient(135deg, rgba(156, 163, 175, 0.08), rgba(16, 15, 12, 0.85))'
  }

  const planetTextColors: Record<string, string> = {
    Sun: 'text-amber-400',
    Moon: 'text-blue-300',
    Mercury: 'text-emerald-400',
    Venus: 'text-pink-300',
    Mars: 'text-red-400',
    Jupiter: 'text-purple-300',
    Saturn: 'text-gray-300'
  }

  const planetRingColors: Record<string, string> = {
    Sun: 'rgba(245, 158, 11, 0.25)',
    Moon: 'rgba(147, 197, 253, 0.25)',
    Mercury: 'rgba(52, 211, 153, 0.25)',
    Venus: 'rgba(244, 114, 182, 0.25)',
    Mars: 'rgba(248, 113, 113, 0.25)',
    Jupiter: 'rgba(196, 181, 253, 0.25)',
    Saturn: 'rgba(156, 163, 175, 0.25)'
  }

  const planetBgColors: Record<string, string> = {
    Sun: 'rgba(245, 158, 11, 0.08)',
    Moon: 'rgba(147, 197, 253, 0.08)',
    Mercury: 'rgba(52, 211, 153, 0.08)',
    Venus: 'rgba(244, 114, 182, 0.08)',
    Mars: 'rgba(248, 113, 113, 0.08)',
    Jupiter: 'rgba(196, 181, 253, 0.08)',
    Saturn: 'rgba(156, 163, 175, 0.08)'
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-earth-100">Planetary Timing</h1>
        <p className="text-xs text-earth-500 mt-0.5">
          Optimal times for harvesting, preparing, and taking plant medicines
        </p>
      </div>

      {/* Current Moment */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Day Ruler', planet: dayRuler, sub: currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
          { label: 'Current Planetary Hour', planet: currentPlanetaryHour.planet, sub: `Hour ${currentPlanetaryHour.hourNumber} \u2014 ${currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` }
        ].map((item) => (
          <div key={item.label} className="card-glow-celestial"
               style={{ background: planetGradients[item.planet] }}>
            <div className="section-subtitle">{item.label}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl animate-pulse-slow">{planetSymbols[item.planet]}</span>
              <div>
                <div className="text-xl font-display font-bold text-earth-100">{item.planet}</div>
                <div className="text-sm text-earth-400">{item.sub}</div>
              </div>
            </div>
            {item.label === 'Day Ruler' ? (
              <div className="mt-3">
                <div className="text-xs text-earth-500 mb-1.5">Best activities today:</div>
                <div className="space-y-1">
                  {getOptimalActivities(item.planet).map((act, i) => (
                    <p key={i} className="text-xs text-earth-400">{act}</p>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => loadPlanetPlants(item.planet)}
                className="mt-3 text-xs text-botanical-500 hover:text-botanical-400 transition-colors duration-200 ease-out-expo"
              >
                View aligned plants {'\u2192'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Today's Hours */}
      <div className="card mb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl opacity-50">{'\u231A'}</span>
          <h3 className="section-title mb-0">Today's Planetary Hours</h3>
        </div>
        <p className="text-xs text-earth-600 mb-4">Simplified model: sunrise at 6:00 AM. Each hour is governed by a planet in Chaldean sequence.</p>
        <div className="grid grid-cols-6 gap-3">
          {todayHours.slice(0, 18).map((h) => (
            <button
              key={h.hour}
              onClick={() => loadPlanetPlants(h.planet)}
              className={`p-2.5 rounded-xl text-center transition-all duration-200 ease-out-expo ${planetTextColors[h.planet]}`}
              style={{
                background: h.isCurrent ? planetBgColors[h.planet] : 'rgba(36, 34, 30, 0.4)',
                border: h.isCurrent ? `1px solid ${planetRingColors[h.planet]}` : '1px solid rgba(255, 255, 255, 0.05)',
                opacity: h.isCurrent ? 1 : 0.55,
                boxShadow: h.isCurrent ? `0 0 20px -4px ${planetRingColors[h.planet]}` : 'none'
              }}
              onMouseEnter={(e) => { if (!h.isCurrent) (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
              onMouseLeave={(e) => { if (!h.isCurrent) (e.currentTarget as HTMLElement).style.opacity = '0.55' }}
            >
              <div className="text-lg">{planetSymbols[h.planet]}</div>
              <div className="text-[10px] text-earth-400 mt-0.5">
                {h.hour.toString().padStart(2, '0')}:00
              </div>
              <div className="text-[10px] font-medium">{h.planet}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Planet's Plants */}
      {selectedPlanetName && (
        <div className="card-glow-botanical animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{planetSymbols[selectedPlanetName]}</span>
            <h3 className="section-title mb-0">{selectedPlanetName}-Aligned Plants</h3>
          </div>
          <p className="text-xs text-earth-500 mb-4">
            These plants are best harvested, prepared, or taken during {selectedPlanetName} hours and days.
          </p>
          {selectedPlanetPlants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedPlanetPlants.map((plant: any) => (
                <div key={plant.id} className="rounded-xl p-3"
                     style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-botanical-400 font-medium">{plant.common_name}</span>
                  <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-earth-600 text-sm">No plants associated with this planet in the current database.</p>
          )}

          <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div className="section-subtitle">Optimal activities during {selectedPlanetName} hours</div>
            <div className="space-y-1 mt-1">
              {getOptimalActivities(selectedPlanetName).map((act, i) => (
                <p key={i} className="text-xs text-earth-400">{act}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
