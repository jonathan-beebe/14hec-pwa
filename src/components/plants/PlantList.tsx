import { useEffect, useMemo, useState } from 'react'
import { api } from '@/data/api'
import type { Plant, PlanetData, ZodiacSign } from '@/types'
import Badge from '@/components/design-system/atoms/Badge'
import BrowseTile from '@/components/design-system/components/BrowseTile'
import CatalogLayout from '@/components/design-system/layouts/CatalogLayout'
import CatalogHeader from '@/components/design-system/components/CatalogHeader'
import { CatalogGrid } from '@/components/design-system/components/CatalogGrid'
import CatalogEmpty from '@/components/design-system/components/CatalogEmpty'
import FilterBar from '@/components/design-system/components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '@/components/design-system/hooks/useCollectionFilters'
import { formatCatalogStatus } from '@/components/design-system/utils/formatCatalogStatus'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'entheogenic', label: 'Entheogenic' },
  { value: 'both', label: 'Both' },
]

const ELEMENT_OPTIONS = [
  { value: '', label: 'All elements' },
  { value: 'fire', label: 'Fire' },
  { value: 'water', label: 'Water' },
  { value: 'air', label: 'Air' },
  { value: 'earth', label: 'Earth' },
]

function buildFilters(
  planets: PlanetData[],
  signs: ZodiacSign[],
): CatalogFilter[] {
  return [
    { kind: 'search', key: 'q', placeholder: 'Search by name…', label: 'Search' },
    { kind: 'select', key: 'category', label: 'Category', options: CATEGORY_OPTIONS },
    {
      kind: 'select',
      key: 'planet',
      label: 'Planet',
      options: [
        { value: '', label: 'All planets' },
        ...planets.map((p) => ({ value: p.name, label: `${p.symbol} ${p.name}` })),
      ],
    },
    {
      kind: 'select',
      key: 'sign',
      label: 'Zodiac sign',
      options: [
        { value: '', label: 'All signs' },
        ...signs.map((s) => ({ value: s.name, label: `${s.symbol} ${s.name}` })),
      ],
    },
    { kind: 'select', key: 'element', label: 'Element', options: ELEMENT_OPTIONS },
  ]
}

function valuesToApiFilters(values: Record<string, string>) {
  return {
    search: values.q || undefined,
    category: values.category || undefined,
    planet: values.planet || undefined,
    zodiacSign: values.sign || undefined,
    element: values.element || undefined,
  }
}

export default function PlantList() {
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [total, setTotal] = useState(0)
  const [plants, setPlants] = useState<Plant[]>([])

  const filterConfig = useMemo(
    () => buildFilters(planets, signs),
    [planets, signs],
  )
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(filterConfig)

  useEffect(() => {
    api.getPlanets().then(setPlanets)
    api.getZodiacSigns().then(setSigns)
    api.getPlants().then((p) => setTotal(p.length))
  }, [])

  useEffect(() => {
    api.getPlants(valuesToApiFilters(values)).then(setPlants)
  }, [values])

  const statusMessage = formatCatalogStatus(
    plants.length,
    total,
    hasActiveFilters,
    { noun: 'plant' },
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="Plants"
          count={plants.length}
          total={total}
          subtitle="Browse 207 medicinal, energetic, and ceremonial plants. Filter by category, planet, zodiac sign, or element."
        />
      }
      filters={
        <div className="px-8 py-3">
          <FilterBar
            filters={filterConfig}
            values={values}
            onChange={setValue}
            onClear={clear}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      }
      results={
        <CatalogGrid>
          {plants.map((plant) => (
            <BrowseTile key={plant.id} to={`/plants/${plant.id}`}>
              <div className="flex justify-between items-start mb-1.5 gap-2">
                <span className="text-sm font-medium text-earth-100">
                  {plant.common_name}
                </span>
                <Badge variant={plant.category}>{plant.category}</Badge>
              </div>
              <p className="text-xs text-earth-500 italic mb-1.5">
                {plant.latin_name}
              </p>
              <p className="text-xs text-earth-400 line-clamp-2">
                {plant.description}
              </p>
              {plant.energetic_quality && (
                <p className="text-[11px] text-celestial-500/60 mt-1.5 line-clamp-1">
                  {plant.energetic_quality}
                </p>
              )}
            </BrowseTile>
          ))}
        </CatalogGrid>
      }
      empty={
        <CatalogEmpty message="No plants match your filters." onClear={clear} />
      }
      itemCount={plants.length}
      statusMessage={statusMessage}
    />
  )
}
