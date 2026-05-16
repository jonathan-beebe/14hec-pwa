import { useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, PlanetData } from '@/types'
import Text from '@/components/design-system/atoms/Text'
import { RoutedListDetailLayout } from '@/components/design-system/layouts/ListDetailLayout'
import PlanetFlatListRow from '@/components/design-system/components/PlanetFlatListRow'
import ListDetailEmpty from '@/components/design-system/components/ListDetailEmpty'
import { allPlanets, type PlanetVisual } from '@/components/design-system/components/planet/planetConfig'
import {
  ASTROLOGY_LIST_WIDTH,
  ASTROLOGY_TOP_INSET,
  AssociatedPlants,
  DetailFact,
  slug,
} from './AstrologyShared'

// Planet name → PlanetVisual config. Visual configs live alongside the
// tile, so list rendering reads them directly without going through the
// data layer.
const PLANET_CONFIG: Record<string, PlanetVisual> = Object.fromEntries(
  allPlanets.map((p) => [p.name, p]),
)

function PlanetsList({ planets }: { planets: PlanetData[] }) {
  // Order tiles by the visual config order (Sun, Moon, Mercury, …) so
  // the column reads in classical sequence regardless of API ordering.
  const ordered = useMemo(() => {
    const byName = new Map(planets.map((p) => [p.name, p]))
    return allPlanets
      .map((cfg) => byName.get(cfg.name))
      .filter((p): p is PlanetData => p !== undefined)
  }, [planets])

  // Same pattern as SignsList — read the active slug off the child route
  // directly since :slug isn't on this component's params hierarchy.
  const match = useMatch('/astrology/planets/:slug')
  const activeSlug = match?.params.slug?.toLowerCase()

  return (
    <ul>
      {ordered.map((planet) => {
        const config = PLANET_CONFIG[planet.name]
        if (!config) return null
        const tileSlug = slug(planet.name)
        return (
          <li key={planet.id}>
            <PlanetFlatListRow
              config={config}
              primary={planet.name}
              secondary={planet.associated_signs}
              to={tileSlug}
              selected={activeSlug === tileSlug}
              aria-label={`${planet.name} — ${planet.associated_signs}`}
            />
          </li>
        )
      })}
    </ul>
  )
}

export default function PlanetsView() {
  const [planets, setPlanets] = useState<PlanetData[]>([])

  useEffect(() => {
    api.getPlanets().then(setPlanets)
  }, [])

  return (
    <RoutedListDetailLayout
      list={<PlanetsList planets={planets} />}
      emptyDetail={
        <ListDetailEmpty
          icon={'☉'}
          message="Select a planet to view its correspondences."
        />
      }
      sidebarWidthClass={ASTROLOGY_LIST_WIDTH}
      topInset={ASTROLOGY_TOP_INSET}
    />
  )
}

type PlanetFullDetail = PlanetData & { plants?: Plant[] }

export function PlanetDetailView() {
  const { slug: planetSlug } = useParams<{ slug: string }>()
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [detail, setDetail] = useState<PlanetFullDetail | null>(null)

  useEffect(() => {
    api.getPlanets().then(setPlanets)
  }, [])

  const target = useMemo(
    () => planets.find((p) => slug(p.name) === planetSlug?.toLowerCase()),
    [planets, planetSlug],
  )

  useEffect(() => {
    if (target === undefined) {
      setDetail(null)
      return
    }
    let cancelled = false
    api.getPlanetById(target.id).then((d) => {
      if (!cancelled) setDetail(d)
    })
    return () => {
      cancelled = true
    }
  }, [target])

  if (planetSlug && planets.length > 0 && target === undefined) {
    return (
      <div className="p-6 text-earth-500 text-sm">
        Planet &ldquo;{planetSlug}&rdquo; not found.
      </div>
    )
  }

  if (!detail) {
    return <div className="p-6 text-earth-500 text-sm">Loading…</div>
  }

  return (
    <article className="p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-5">
        <span className="text-5xl">{detail.symbol}</span>
        <div>
          <Text.PageTitle as="h2">{detail.name}</Text.PageTitle>
          <p className="text-sm text-earth-500">{detail.associated_signs}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <DetailFact label="Body Systems">{detail.body_systems}</DetailFact>
        <DetailFact label="Energetic Quality">
          {detail.energetic_quality}
        </DetailFact>
      </div>

      <p className="text-sm text-earth-400 mb-5 leading-relaxed">
        {detail.description}
      </p>

      {detail.plants && detail.plants.length > 0 && (
        <AssociatedPlants plants={detail.plants} />
      )}
    </article>
  )
}
