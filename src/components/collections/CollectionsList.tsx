import { useEffect, useMemo, useState } from 'react'
import { api } from '@/data/api'
import type { Collection } from '@/types'
import Button from '@/components/design-system/atoms/Button'
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

const FILTERS: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search collections…', label: 'Search' },
]

const COLOR_TEXT: Record<string, string> = {
  botanical: 'text-botanical-400',
  celestial: 'text-celestial-400',
  gold: 'text-gold-400',
  heart: 'text-rose-400',
  mind: 'text-blue-400',
}

function filterCollections(values: Record<string, string>, all: Collection[]) {
  const q = (values.q ?? '').trim().toLowerCase()
  if (!q) return all
  return all.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q),
  )
}

export default function CollectionsList() {
  const [all, setAll] = useState<Collection[]>([])
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(FILTERS)

  useEffect(() => {
    api.getCollections().then(setAll)
  }, [])

  const filtered = useMemo(() => filterCollections(values, all), [values, all])
  const statusMessage = formatCatalogStatus(
    filtered.length,
    all.length,
    hasActiveFilters,
    { noun: 'collection' },
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="My Collections"
          count={hasActiveFilters ? filtered.length : undefined}
          total={hasActiveFilters ? all.length : undefined}
          subtitle="Personal groupings of plants that share a purpose, season, or meaning."
          actions={
            <Button.Primary route="/collections/new">
              + New collection
            </Button.Primary>
          }
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
        <CatalogGrid>
          {filtered.map((collection) => {
            const textClass = COLOR_TEXT[collection.color] ?? 'text-earth-100'
            return (
              <BrowseTile
                key={collection.id}
                to={`/collections/${collection.id}`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl opacity-50">
                      {collection.icon || '☘'}
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`text-sm font-medium ${textClass} truncate`}
                      >
                        {collection.name}
                      </span>
                      <p className="text-[10px] text-earth-500">
                        {collection.plant_count}{' '}
                        {collection.plant_count === 1 ? 'plant' : 'plants'}
                      </p>
                    </div>
                  </div>
                </div>
                {collection.description && (
                  <p className="text-xs text-earth-400 line-clamp-2 leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </BrowseTile>
            )
          })}
        </CatalogGrid>
      }
      empty={
        hasActiveFilters ? (
          <CatalogEmpty
            message="No collections match your filters."
            onClear={clear}
          />
        ) : (
          <CatalogEmpty
            message="No collections yet. Create your first to organize plants that matter to you."
            icon={<span className="text-3xl">{'♡'}</span>}
            actions={
              <Button.Primary route="/collections/new">
                Create your first collection
              </Button.Primary>
            }
          />
        )
      }
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}
