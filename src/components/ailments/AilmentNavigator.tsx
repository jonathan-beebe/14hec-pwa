import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { Ailment } from '@/types'

export default function AilmentNavigator() {
  const navigate = useNavigate()
  const [ailments, setAilments] = useState<Ailment[]>([])
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const filters: any = {}
    if (filterCategory) filters.category = filterCategory
    if (search) filters.search = search
    api.getAilments(filters).then(setAilments)
  }, [filterCategory, search])

  const grouped = ailments.reduce<Record<string, Ailment[]>>((acc, a) => {
    const key = a.body_system || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const categoryColors: Record<string, string> = {
    physical: 'badge-earth',
    emotional: 'badge-water',
    spiritual: 'badge-air'
  }

  const categoryIcons: Record<string, string> = {
    physical: '\u2618',
    emotional: '\u2661',
    spiritual: '\u2726'
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-display font-bold text-earth-100">Ailments</h1>
        <p className="text-sm text-earth-500">{ailments.length} conditions in database</p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search ailments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {[
              { cat: '', label: 'All' },
              { cat: 'physical', label: 'Physical' },
              { cat: 'emotional', label: 'Emotional' },
              { cat: 'spiritual', label: 'Spiritual' }
            ].map(({ cat, label }) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  filterCategory === cat
                    ? 'text-botanical-200 shadow-glow-botanical'
                    : 'bg-earth-800/40 text-earth-400 hover:text-earth-200'
                }`}
                style={filterCategory === cat ? { background: 'linear-gradient(135deg, rgba(45, 112, 72, 0.3), rgba(35, 90, 58, 0.3))' } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped by body system */}
      <div className="space-y-8">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([system, items]) => (
            <div key={system}>
              <h2 className="section-subtitle mb-3 text-sm">
                {system}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((ailment) => (
                  <button
                    key={ailment.id}
                    onClick={() => navigate('/ailments/' + ailment.id)}
                    className="card text-left cursor-pointer py-4 group"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-40">{categoryIcons[ailment.category]}</span>
                        <span className="text-earth-200 font-medium group-hover:text-botanical-400 transition-colors">{ailment.name}</span>
                      </div>
                      <span className={`badge ${categoryColors[ailment.category]}`}>
                        {ailment.category}
                      </span>
                    </div>
                    <p className="text-xs text-earth-500 line-clamp-2 pl-6">{ailment.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
