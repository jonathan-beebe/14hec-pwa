import { useEffect, useMemo, useState } from 'react'
import { api } from '@/data/api'
import type { Ailment } from '@/types'
import Badge from '@/components/design-system/atoms/Badge'
import BrowseTile from '@/components/design-system/components/BrowseTile'
import CatalogLayout from '@/components/design-system/layouts/CatalogLayout'
import CatalogHeader from '@/components/design-system/components/CatalogHeader'
import {
  CatalogGrid,
  CatalogGroup,
  CatalogGroupedResults,
} from '@/components/design-system/components/CatalogGrid'
import CatalogEmpty from '@/components/design-system/components/CatalogEmpty'
import FilterBar from '@/components/design-system/components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '@/components/design-system/hooks/useCollectionFilters'
import { formatCatalogStatus } from '@/components/design-system/utils/formatCatalogStatus'

const FILTERS: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search ailments…', label: 'Search' },
  {
    kind: 'select',
    key: 'category',
    label: 'Category',
    options: [
      { value: '', label: 'All categories' },
      { value: 'physical', label: 'Physical' },
      { value: 'emotional', label: 'Emotional' },
      { value: 'spiritual', label: 'Spiritual' },
    ],
  },
]

const categoryVariant: Record<Ailment['category'], 'earth' | 'water' | 'air'> = {
  physical: 'earth',
  emotional: 'water',
  spiritual: 'air',
}

function filterAilments(values: Record<string, string>, all: Ailment[]) {
  const q = (values.q ?? '').trim().toLowerCase()
  const category = values.category ?? ''
  return all.filter((a) => {
    if (category && a.category !== category) return false
    if (!q) return true
    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    )
  })
}

function groupByBodySystem(items: Ailment[]) {
  const map = new Map<string, Ailment[]>()
  for (const a of items) {
    const key = a.body_system || 'Other'
    const bucket = map.get(key)
    if (bucket) bucket.push(a)
    else map.set(key, [a])
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

export default function AilmentNavigator() {
  const [all, setAll] = useState<Ailment[]>([])
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(FILTERS)

  useEffect(() => {
    api.getAilments().then(setAll)
  }, [])

  const filtered = useMemo(() => filterAilments(values, all), [values, all])
  const grouped = useMemo(() => groupByBodySystem(filtered), [filtered])
  const statusMessage = formatCatalogStatus(
    filtered.length,
    all.length,
    hasActiveFilters,
    { noun: 'ailment' },
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="Ailments"
          count={filtered.length}
          total={all.length}
          subtitle="Conditions across physical, emotional, and spiritual dimensions, grouped by body system."
        />
      }
      filters={
        <div className="px-4 md:px-8 py-3">
          <FilterBar
            filters={FILTERS}
            values={values}
            onChange={setValue}
            onClear={clear}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      }
      results={
        <CatalogGroupedResults>
          {grouped.map(([system, items]) => (
            <CatalogGroup
              key={system}
              heading={`${system} (${items.length})`}
            >
              <CatalogGrid>
                {items.map((ailment) => (
                  <BrowseTile key={ailment.id} to={`/ailments/${ailment.id}`}>
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <span className="text-sm font-medium text-earth-100">
                        {ailment.name}
                      </span>
                      <Badge variant={categoryVariant[ailment.category]}>
                        {ailment.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-earth-400 line-clamp-2">
                      {ailment.description}
                    </p>
                  </BrowseTile>
                ))}
              </CatalogGrid>
            </CatalogGroup>
          ))}
        </CatalogGroupedResults>
      }
      empty={
        <CatalogEmpty message="No ailments match your filters." onClear={clear} />
      }
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}
