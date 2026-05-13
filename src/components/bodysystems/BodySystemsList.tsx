import { useEffect, useMemo, useState } from 'react'
import { api } from '@/data/api'
import type { BodySystem } from '@/types'
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

const CATEGORY_ORDER: BodySystem['category'][] = [
  'system',
  'organ',
  'gland',
  'tissue',
  'structure',
]

const CATEGORY_LABELS: Record<BodySystem['category'], string> = {
  organ: 'Organs',
  system: 'Systems',
  tissue: 'Tissues',
  gland: 'Glands',
  structure: 'Structures',
}

const CATEGORY_BADGE: Record<BodySystem['category'], string> = {
  organ: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  system: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  tissue: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  gland: 'bg-purple-500/10 text-purple-300 ring-purple-500/20',
  structure: 'bg-green-500/10 text-green-300 ring-green-500/20',
}

const FILTERS: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search body systems…', label: 'Search' },
  {
    kind: 'select',
    key: 'category',
    label: 'Category',
    options: [
      { value: '', label: 'All categories' },
      { value: 'system', label: 'Systems' },
      { value: 'organ', label: 'Organs' },
      { value: 'gland', label: 'Glands' },
      { value: 'tissue', label: 'Tissues' },
      { value: 'structure', label: 'Structures' },
    ],
  },
]

function filterSystems(values: Record<string, string>, all: BodySystem[]) {
  const q = (values.q ?? '').trim().toLowerCase()
  const category = values.category ?? ''
  return all.filter((s) => {
    if (category && s.category !== category) return false
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description ?? '').toLowerCase().includes(q)
    )
  })
}

function groupByCategory(items: BodySystem[]) {
  const map = new Map<BodySystem['category'], BodySystem[]>()
  for (const cat of CATEGORY_ORDER) map.set(cat, [])
  for (const item of items) {
    const bucket = map.get(item.category)
    if (bucket) bucket.push(item)
  }
  return map
}

function CategoryBadge({ category }: { category: BodySystem['category'] }) {
  return (
    <span
      className={
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ring-1 ring-inset ' +
        CATEGORY_BADGE[category]
      }
    >
      {category}
    </span>
  )
}

export default function BodySystemsList() {
  const [all, setAll] = useState<BodySystem[]>([])
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(FILTERS)

  useEffect(() => {
    api.getBodySystems().then(setAll)
  }, [])

  const filtered = useMemo(() => filterSystems(values, all), [values, all])
  const grouped = useMemo(() => groupByCategory(filtered), [filtered])
  const statusMessage = formatCatalogStatus(
    filtered.length,
    all.length,
    hasActiveFilters,
    { noun: 'body system' },
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="Body Systems"
          count={filtered.length}
          total={all.length}
          subtitle="Organs, systems, glands, tissues, and structures — mapped to plants, planets, and ancient wisdom."
        />
      }
      filters={
        <div className="px-8 py-3">
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
          {CATEGORY_ORDER.map((category) => {
            const items = grouped.get(category) ?? []
            if (items.length === 0) return null
            return (
              <CatalogGroup
                key={category}
                heading={`${CATEGORY_LABELS[category]} (${items.length})`}
              >
                <CatalogGrid>
                  {items.map((sys) => (
                    <BrowseTile key={sys.id} to={`/body-systems/${sys.id}`}>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <span className="text-sm font-medium text-earth-100">
                          {sys.name}
                        </span>
                        <CategoryBadge category={sys.category} />
                      </div>
                      <p className="text-xs text-earth-400 line-clamp-2 leading-relaxed mb-3">
                        {sys.description}
                      </p>
                      <div className="space-y-1.5">
                        {sys.tcm_element && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-earth-500 uppercase tracking-[0.15em] w-12">
                              TCM
                            </span>
                            <span className="text-xs text-earth-300">
                              {sys.tcm_element}
                            </span>
                          </div>
                        )}
                        {sys.ayurvedic_dosha && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-earth-500 uppercase tracking-[0.15em] w-12">
                              Dosha
                            </span>
                            <span className="text-xs text-earth-300">
                              {sys.ayurvedic_dosha}
                            </span>
                          </div>
                        )}
                      </div>
                    </BrowseTile>
                  ))}
                </CatalogGrid>
              </CatalogGroup>
            )
          })}
        </CatalogGroupedResults>
      }
      empty={
        <CatalogEmpty
          message="No body systems match your filters."
          onClear={clear}
        />
      }
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}
