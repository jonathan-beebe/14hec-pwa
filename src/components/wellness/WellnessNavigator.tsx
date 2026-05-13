import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { WellnessCategory, WellnessGoal } from '@/types'
import Text from '@/components/design-system/atoms/Text'
import BrowseTile from '@/components/design-system/components/BrowseTile'
import { CatalogGrid } from '@/components/design-system/components/CatalogGrid'
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

const SEARCH_MIN = 2

export default function WellnessNavigator() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<WellnessCategory[]>([])
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [categoryGoals, setCategoryGoals] = useState<
    Record<number, WellnessGoal[]>
  >({})
  const [searchResults, setSearchResults] = useState<WellnessGoal[]>([])
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(FILTERS)
  const search = values.q ?? ''

  useEffect(() => {
    api.getWellnessCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (search.length >= SEARCH_MIN) {
      api.searchWellnessGoals(search).then(setSearchResults)
    } else {
      setSearchResults([])
    }
  }, [search])

  const toggleCategory = (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
      return
    }
    setExpandedCategory(categoryId)
    if (!categoryGoals[categoryId]) {
      api.getWellnessGoalsByCategory(categoryId).then((goals) => {
        setCategoryGoals((prev) => ({ ...prev, [categoryId]: goals }))
      })
    }
  }

  const totalGoals = useMemo(
    () => categories.reduce((sum, c) => sum + c.goal_count, 0),
    [categories],
  )

  const isSearching = search.length >= SEARCH_MIN
  const statusMessage = isSearching
    ? formatCatalogStatus(searchResults.length, totalGoals, true, {
        noun: 'wellness goal',
        nounPlural: 'wellness goals',
      })
    : `${categories.length} categories · ${totalGoals} wellness goals`

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <Text.PageTitle>Wellness Goals</Text.PageTitle>
        <p className="text-sm text-earth-500">
          {categories.length} categories · {totalGoals} goals — explore what
          you want to strengthen, improve, or protect
        </p>
      </div>

      <div className="mb-6">
        <FilterBar
          filters={FILTERS}
          values={values}
          onChange={setValue}
          onClear={clear}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <div role="status" className="sr-only">
        {statusMessage}
      </div>

      {/* Search mode: flat catalog of matching goals */}
      {isSearching && (
        <section className="mb-8">
          <Text.SectionLabel as="h2" className="mb-3 text-sm">
            {searchResults.length} result
            {searchResults.length !== 1 ? 's' : ''} for "{search}"
          </Text.SectionLabel>
          {searchResults.length > 0 ? (
            <CatalogGrid className="px-0 pt-0">
              {searchResults.map((goal) => (
                <BrowseTile key={goal.id} to={`/wellness/${goal.id}`}>
                  <div className="flex justify-between items-center mb-1.5 gap-2">
                    <span className="text-earth-200 font-medium">
                      {goal.name}
                    </span>
                    <span className="text-[10px] text-botanical-300 bg-botanical-500/10 ring-1 ring-inset ring-botanical-500/20 rounded-md px-2 py-0.5">
                      {goal.plant_count} plants
                    </span>
                  </div>
                  <p className="text-[10px] text-earth-500 uppercase tracking-wider mb-1">
                    {goal.category_name}
                  </p>
                  <p className="text-xs text-earth-500 line-clamp-2">
                    {goal.description}
                  </p>
                </BrowseTile>
              ))}
            </CatalogGrid>
          ) : (
            <p className="text-sm text-earth-500">
              No wellness goals found matching your search.
            </p>
          )}
        </section>
      )}

      {/* Tree mode: categories with expandable goals */}
      {!isSearching && (
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategory === category.id
            const goals = categoryGoals[category.id] || []

            return (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left group"
                >
                  <div
                    className="rounded-2xl p-4 transition-all duration-200"
                    style={{
                      background: isExpanded
                        ? 'linear-gradient(135deg, rgba(93, 168, 126, 0.08), rgba(16, 15, 12, 0.85))'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isExpanded
                        ? '1px solid rgba(93, 168, 126, 0.15)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        ;(e.currentTarget as HTMLElement).style.borderColor =
                          'rgba(93, 168, 126, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        ;(e.currentTarget as HTMLElement).style.borderColor =
                          'rgba(255, 255, 255, 0.06)'
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg opacity-50">
                          {category.icon}
                        </span>
                        <div>
                          <span className="text-earth-200 font-display font-medium group-hover:text-botanical-400 transition-colors">
                            {category.name}
                          </span>
                          <p className="text-xs text-earth-500 mt-0.5 line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-earth-500">
                          {category.goal_count} goal
                          {category.goal_count !== 1 ? 's' : ''}
                        </span>
                        <span
                          aria-hidden
                          className={`text-earth-500 text-sm transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        >
                          ▶
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 ml-4 grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in">
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => navigate('/wellness/' + goal.id)}
                        className="card text-left cursor-pointer py-3 px-4 group"
                      >
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <span className="text-sm text-earth-200 font-medium group-hover:text-botanical-400 transition-colors">
                            {goal.name}
                          </span>
                          <span className="text-[10px] text-botanical-300 bg-botanical-500/10 ring-1 ring-inset ring-botanical-500/20 rounded-md px-2 py-0.5">
                            {goal.plant_count} plants
                          </span>
                        </div>
                        {goal.desired_outcome && (
                          <p className="text-xs text-earth-500 line-clamp-1">
                            {goal.desired_outcome}
                          </p>
                        )}
                        {goal.body_system && (
                          <p className="text-[10px] text-earth-600 mt-1">
                            {goal.body_system}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
