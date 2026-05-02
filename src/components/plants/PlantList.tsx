import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, PlanetData, ZodiacSign } from '../../types'
import Button from '@/components/design-system/atoms/Button'

export default function PlantList() {
  const navigate = useNavigate()
  const [plants, setPlants] = useState<Plant[]>([])
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPlanet, setFilterPlanet] = useState('')
  const [filterSign, setFilterSign] = useState('')
  const [filterElement, setFilterElement] = useState('')

  useEffect(() => {
    api.getPlanets().then(setPlanets)
    api.getZodiacSigns().then(setSigns)
  }, [])

  useEffect(() => {
    const filters: any = {}
    if (search) filters.search = search
    if (filterCategory) filters.category = filterCategory
    if (filterPlanet) filters.planet = filterPlanet
    if (filterSign) filters.zodiacSign = filterSign
    if (filterElement) filters.element = filterElement
    api.getPlants(filters).then(setPlants)
  }, [search, filterCategory, filterPlanet, filterSign, filterElement])

  const clearFilters = () => {
    setSearch('')
    setFilterCategory('')
    setFilterPlanet('')
    setFilterSign('')
    setFilterElement('')
  }

  const hasFilters = search || filterCategory || filterPlanet || filterSign || filterElement

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-display font-bold text-earth-100">Plants</h1>
          <span className="badge badge-conventional">{plants.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="select-field">
            <option value="">All Categories</option>
            <option value="conventional">Conventional</option>
            <option value="entheogenic">Entheogenic</option>
            <option value="both">Both</option>
          </select>
          <select value={filterPlanet} onChange={(e) => setFilterPlanet(e.target.value)} className="select-field">
            <option value="">All Planets</option>
            {planets.map((p) => (
              <option key={p.id} value={p.name}>{p.symbol} {p.name}</option>
            ))}
          </select>
          <select value={filterSign} onChange={(e) => setFilterSign(e.target.value)} className="select-field">
            <option value="">All Signs</option>
            {signs.map((s) => (
              <option key={s.id} value={s.name}>{s.symbol} {s.name}</option>
            ))}
          </select>
          <select value={filterElement} onChange={(e) => setFilterElement(e.target.value)} className="select-field">
            <option value="">All Elements</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="air">Air</option>
            <option value="earth">Earth</option>
          </select>
          {hasFilters && (
            <Button.Ghost onClick={clearFilters} className="text-xs">
              Clear filters
            </Button.Ghost>
          )}
        </div>
      </div>

      {/* Plant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
        {plants.map((plant) => (
          <button
            key={plant.id}
            onClick={() => navigate(`/plants/${plant.id}`)}
            className="card p-4 text-left cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="text-sm font-display font-semibold text-botanical-400 group-hover:text-botanical-300 transition-colors duration-200 ease-out-expo">{plant.common_name}</h3>
              <span className={`badge badge-${plant.category}`}>{plant.category}</span>
            </div>
            <p className="text-xs text-earth-500 italic mb-1.5">{plant.latin_name}</p>
            <p className="text-xs text-earth-400 line-clamp-2">{plant.description}</p>
            {plant.energetic_quality && (
              <p className="text-[11px] text-celestial-500/60 mt-1.5 line-clamp-1">{plant.energetic_quality}</p>
            )}
          </button>
        ))}
      </div>

      {plants.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <div className="text-3xl mb-2 opacity-20">{'\u2618'}</div>
          <p className="text-sm text-earth-500">No plants found matching your filters.</p>
          {hasFilters && (
            <Button.Ghost onClick={clearFilters} className="text-xs mt-3 text-botanical-400/60 hover:text-botanical-300">
              Clear all filters
            </Button.Ghost>
          )}
        </div>
      )}
    </div>
  )
}
