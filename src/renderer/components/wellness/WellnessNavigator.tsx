import { useState, useEffect } from 'react'
import type { Page } from '../../App'
import type { WellnessCategory, WellnessGoal } from '../../types'

interface WellnessNavigatorProps {
  navigate: (page: Page) => void
}

export default function WellnessNavigator({ navigate }: WellnessNavigatorProps) {
  const [categories, setCategories] = useState<WellnessCategory[]>([])
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [categoryGoals, setCategoryGoals] = useState<Record<number, WellnessGoal[]>>({})
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<WellnessGoal[]>([])

  useEffect(() => {
    window.api.getWellnessCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (search.length >= 2) {
      window.api.searchWellnessGoals(search).then(setSearchResults)
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
      window.api.getWellnessGoalsByCategory(categoryId).then((goals) => {
        setCategoryGoals((prev) => ({ ...prev, [categoryId]: goals }))
      })
    }
  }

  const totalGoals = categories.reduce((sum, c) => sum + c.goal_count, 0)

  const isSearching = search.length >= 2

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-display font-bold text-earth-100">Wellness Goals</h1>
        <p className="text-sm text-earth-500">
          {categories.length} categories {'\u00b7'} {totalGoals} goals {'\u2014'} explore what you want to strengthen, improve, or protect
        </p>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search wellness goals... (e.g. hair growth, immunity, sleep)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="mb-8">
          <h2 className="section-subtitle mb-3 text-sm">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => navigate({ view: 'wellness-detail', id: goal.id })}
                  className="card text-left cursor-pointer py-4 group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-earth-200 font-medium group-hover:text-botanical-400 transition-colors">
                      {goal.name}
                    </span>
                    <span className="badge badge-botanical">{goal.plant_count} plants</span>
                  </div>
                  <p className="text-[10px] text-earth-500 uppercase tracking-wider mb-1">{goal.category_name}</p>
                  <p className="text-xs text-earth-500 line-clamp-2">{goal.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-earth-500">No wellness goals found matching your search.</p>
          )}
        </div>
      )}

      {/* Categories with expandable goals */}
      {!isSearching && (
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategory === category.id
            const goals = categoryGoals[category.id] || []

            return (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
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
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(93, 168, 126, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.06)'
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg opacity-50">{category.icon}</span>
                        <div>
                          <span className="text-earth-200 font-display font-medium group-hover:text-botanical-400 transition-colors">
                            {category.name}
                          </span>
                          <p className="text-xs text-earth-500 mt-0.5 line-clamp-1">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-earth-500">{category.goal_count} goal{category.goal_count !== 1 ? 's' : ''}</span>
                        <span className={`text-earth-500 text-sm transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          {'\u25B6'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded goals */}
                {isExpanded && (
                  <div className="mt-2 ml-4 grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in">
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => navigate({ view: 'wellness-detail', id: goal.id })}
                        className="card text-left cursor-pointer py-3 px-4 group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-earth-200 font-medium group-hover:text-botanical-400 transition-colors">
                            {goal.name}
                          </span>
                          <span className="badge badge-botanical text-[10px]">{goal.plant_count} plants</span>
                        </div>
                        {goal.desired_outcome && (
                          <p className="text-xs text-earth-500 line-clamp-1">{goal.desired_outcome}</p>
                        )}
                        {goal.body_system && (
                          <p className="text-[10px] text-earth-600 mt-1">{goal.body_system}</p>
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
