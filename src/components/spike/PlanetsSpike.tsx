import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PlanetField from './PlanetField'
import { allPlanets } from './planetConfig'
import { api } from '@/data/api'
import type { PlanetData, Plant } from '@/types'
import Text from '@/components/design-system/atoms/Text'

type PlanetDetail = PlanetData & { plants?: Plant[] }

const slug = (name: string) => name.toLowerCase()

export default function PlanetsSpike() {
  const navigate = useNavigate()
  const { planetName } = useParams<{ planetName?: string }>()
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [detail, setDetail] = useState<PlanetDetail | null>(null)

  useEffect(() => {
    api.getPlanets().then(setPlanets)
  }, [])

  const planetBySlug = useMemo(
    () => new Map(planets.map((p) => [slug(p.name), p])),
    [planets],
  )

  const selectedPlanet = planetName ? planetBySlug.get(planetName.toLowerCase()) : undefined
  const selectedName = selectedPlanet?.name ?? null
  const selectedId = selectedPlanet?.id

  useEffect(() => {
    if (selectedId === undefined) {
      setDetail(null)
      return
    }
    let cancelled = false
    api.getPlanetById(selectedId).then((d) => {
      if (!cancelled) setDetail(d)
    })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  return (
    <div className="animate-fade-in">
      <PlanetField
        planets={allPlanets}
        selectedName={selectedName}
        onSelect={(p) => navigate(`/spike/planets/${slug(p.name)}`)}
      />

      <div className="px-8 pb-12 max-w-4xl mx-auto">
        {detail ? (
          <div className="card-glow-celestial animate-fade-in">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-5xl">{detail.symbol}</span>
              <div>
                <Text.PageTitle as="h2">{detail.name}</Text.PageTitle>
                <p className="text-sm text-earth-500">{detail.associated_signs}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(36, 34, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Text.SectionLabel>Body Systems</Text.SectionLabel>
                <div className="text-earth-200 text-sm">{detail.body_systems}</div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(36, 34, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Text.SectionLabel>Energetic Quality</Text.SectionLabel>
                <div className="text-earth-200 text-sm">{detail.energetic_quality}</div>
              </div>
            </div>

            <p className="text-sm text-earth-400 mb-5 leading-relaxed">
              {detail.description}
            </p>

            {detail.plants && detail.plants.length > 0 && (
              <div>
                <Text.SectionLabel>Ruled Plants</Text.SectionLabel>
                <div className="space-y-2">
                  {detail.plants.map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => navigate(`/plants/${plant.id}`)}
                      className="w-full text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
                      style={{
                        background: 'rgba(36, 34, 30, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background =
                          'rgba(36, 34, 30, 0.65)'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.background =
                          'rgba(36, 34, 30, 0.4)'
                      }}
                    >
                      <span className="text-botanical-400 group-hover:text-botanical-300 transition-colors">
                        {plant.common_name}
                      </span>
                      <span className="text-earth-500 text-sm ml-2 italic">
                        {plant.latin_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-16 text-earth-500">
            <div className="text-4xl mb-3 opacity-20">{'☉'}</div>
            Select a planet above to view its correspondences
          </div>
        )}
      </div>
    </div>
  )
}
