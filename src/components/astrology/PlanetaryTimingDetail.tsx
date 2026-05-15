import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { api } from '@/data/api'
import type { PlanetData, Plant } from '../../types'
import Text from '@/components/design-system/atoms/Text'
import Button from '@/components/design-system/atoms/Button'
import { getPlanetaryTiming } from '@/lib/astro'
import { useGeolocation } from '@/hooks/useGeolocation'

const DEFAULT_COORDS = { latitude: 40.7128, longitude: -74.006 }

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

const planetSymbols: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄'
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function PlanetaryTimingDetail() {
  const { planet: planetSlug } = useParams()
  const planetName = planetSlug
    ? planetSlug.charAt(0).toUpperCase() + planetSlug.slice(1).toLowerCase()
    : ''

  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const { geo } = useGeolocation()

  const coords = geo.status === 'resolved'
    ? { latitude: geo.latitude, longitude: geo.longitude }
    : DEFAULT_COORDS

  const timing = useMemo(
    () => getPlanetaryTiming(new Date(), coords.latitude, coords.longitude),
    [coords.latitude, coords.longitude]
  )

  const currentHours = useMemo(() => {
    if (!timing) return []
    return timing.hours.filter(h => h.planet === planetName)
  }, [timing, planetName])

  useEffect(() => {
    if (!planetName) return
    setLoading(true)
    api.getPlanets().then(async (allPlanets: PlanetData[]) => {
      const planet = allPlanets.find(p => p.name === planetName)
      if (planet) {
        const detail = await api.getPlanetById(planet.id)
        setPlants(detail?.plants || [])
      }
      setLoading(false)
    })
  }, [planetName])

  if (!planetName || !planetSymbols[planetName]) {
    return (
      <div className="max-w-4xl animate-fade-in">
        <Button.Ghost route="/astrology/planetary-timing" className="mb-4 inline-flex items-center gap-1">
          {'←'} Planetary Timing
        </Button.Ghost>
        <p className="text-earth-500">Unknown planet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <Button.Ghost route="/astrology/planetary-timing" className="mb-4 inline-flex items-center gap-1">
        {'←'} Planetary Timing
      </Button.Ghost>

      <div className="card-glow-celestial mb-5" style={{ background: planetGradients[planetName] }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{planetSymbols[planetName]}</span>
          <div>
            <Text.PageTitle className="mb-0">{planetName}-Aligned Plants</Text.PageTitle>
          </div>
        </div>
        <p className="text-sm text-earth-400">
          Plants best harvested, prepared, or taken during {planetName} hours and days.
        </p>
      </div>

      {currentHours.length > 0 && timing && (
        <div className="card mb-5">
          <Text.SectionLabel>{planetName} hours today</Text.SectionLabel>
          <div className="mt-2 space-y-1">
            {currentHours.map(h => (
              <div key={h.startTime.getTime()} className="text-sm text-earth-400">
                {h.isDay ? '☉' : '☽'} {h.isDay ? 'Day' : 'Night'} hour {h.hourNumber} — {formatTime(h.startTime)} to {formatTime(h.endTime)}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-earth-500 text-sm animate-pulse">Loading plants...</div>
      ) : plants.length > 0 ? (
        <div className="card mb-5">
          <Text.SectionTitle as="h3" className="mb-3">Plants</Text.SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plants.map((plant: Plant) => (
              <Link
                key={plant.id}
                to={`/plants/${plant.id}`}
                className="rounded-xl p-3 transition-colors duration-200 hover:bg-white/[0.03]"
                style={{ background: 'rgba(36, 34, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <span className="text-botanical-400 font-medium">{plant.common_name}</span>
                <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card mb-5">
          <p className="text-earth-600 text-sm">No plants associated with this planet in the current database.</p>
        </div>
      )}

      <div className="card">
        <Text.SectionTitle as="h3" className="mb-3">Optimal Activities</Text.SectionTitle>
        <div className="space-y-1.5">
          {getOptimalActivities(planetName).map((act, i) => (
            <p key={i} className="text-sm text-earth-400">{act}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
