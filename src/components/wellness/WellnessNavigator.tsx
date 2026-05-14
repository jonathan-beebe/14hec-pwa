import { useEffect, useMemo, useState } from 'react'
import { api } from '@/data/api'
import type { WellnessCategory, WellnessGoal } from '@/types'
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
  {
    kind: 'search',
    key: 'q',
    placeholder: 'Search wellness goals… (e.g. hair growth, immunity, sleep)',
    label: 'Search',
  },
]

function filterGoals(values: Record<string, string>, all: WellnessGoal[]) {
  const q = (values.q ?? '').trim().toLowerCase()
  if (!q) return all
  return all.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      (g.desired_outcome ?? '').toLowerCase().includes(q) ||
      g.category_name.toLowerCase().includes(q),
  )
}

export default function WellnessNavigator() {
  const [goals, setGoals] = useState<WellnessGoal[]>([])
  const [categories, setCategories] = useState<WellnessCategory[]>([])
  const { values, setValue, clear, hasActiveFilters, linkToChild } =
    useCollectionFilters(FILTERS)

  useEffect(() => {
    api.getWellnessGoals().then(setGoals)
    api.getWellnessCategories().then(setCategories)
  }, [])

  const filtered = useMemo(() => filterGoals(values, goals), [values, goals])

  const goalsByCategory = useMemo(() => {
    const map = new Map<number, WellnessGoal[]>()
    for (const g of filtered) {
      const bucket = map.get(g.category_id)
      if (bucket) bucket.push(g)
      else map.set(g.category_id, [g])
    }
    return map
  }, [filtered])

  const statusMessage = formatCatalogStatus(
    filtered.length,
    goals.length,
    hasActiveFilters,
    { noun: 'wellness goal', nounPlural: 'wellness goals' },
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="Wellness Goals"
          count={filtered.length}
          total={goals.length}
          subtitle="Explore what you want to strengthen, improve, or protect — grouped by the part of you each plant ally supports."
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
          {categories.map((category) => {
            const items = goalsByCategory.get(category.id) ?? []
            if (items.length === 0) return null
            return (
              <CatalogGroup
                key={category.id}
                heading={
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden className="opacity-50">
                      {category.icon}
                    </span>
                    {category.name}
                  </span>
                }
                description={category.description}
              >
                <CatalogGrid>
                  {items.map((goal) => (
                    <BrowseTile
                      key={goal.id}
                      to={linkToChild(`/wellness/${goal.id}`)}
                    >
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <span className="text-sm font-medium text-earth-100">
                          {goal.name}
                        </span>
                        <span className="text-[10px] text-botanical-300 bg-botanical-500/10 ring-1 ring-inset ring-botanical-500/20 rounded-md px-2 py-0.5 whitespace-nowrap">
                          {goal.plant_count} plants
                        </span>
                      </div>
                      {goal.desired_outcome && (
                        <p className="text-xs text-earth-400 line-clamp-2 leading-relaxed">
                          {goal.desired_outcome}
                        </p>
                      )}
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
          message="No wellness goals match your filters."
          onClear={clear}
        />
      }
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}
