import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Type from '@/components/design-system/atoms/Type'
import SearchInput from '@/components/design-system/atoms/SearchInput'
import Badge from '@/components/design-system/atoms/Badge'
import type { Plant } from '@/types'

interface DashboardHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filteredPlants: Plant[]
}

const LISTBOX_ID = 'search-results'

function optionId(plantId: number) {
  return `search-option-${plantId}`
}

export default function DashboardHeader({
  search,
  onSearchChange,
  filteredPlants,
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const visiblePlants = filteredPlants.slice(0, 5)
  const isOpen = search.length > 0 && visiblePlants.length > 0

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'Escape') {
        onSearchChange('')
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % visiblePlants.length)
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setActiveIndex((prev) => (prev <= 0 ? visiblePlants.length - 1 : prev - 1))
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < visiblePlants.length) {
          navigate(`/plants/${visiblePlants[activeIndex].id}`)
          onSearchChange('')
          setActiveIndex(-1)
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        onSearchChange('')
        setActiveIndex(-1)
        break
      }
    }
  }

  const activeDescendant = activeIndex >= 0 && activeIndex < visiblePlants.length
    ? optionId(visiblePlants[activeIndex].id)
    : undefined

  return (
    <div className="relative overflow-visible rounded-3xl p-8 mb-8 bg-black border border-black shadow-hero">
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="hero-orb w-96 h-96 -top-48 right-0 bg-botanical-300 blur-[100px] opacity-[0.14]" />
        <div className="hero-orb w-72 h-72 -bottom-36 -left-24 bg-celestial-200 blur-[100px] opacity-[0.12]" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-botanical-300 to-celestial-200" />
          <div>
            <Type.Branded.Display className="text-gradient-botanical">
              14 HEC Plant Intelligence
            </Type.Branded.Display>
            <Type.BodySmall as="p" className="mt-1">
              Herbal {'·'} Energetic {'·'} Celestial {'—'} Cross-reference plants, ailments, and astrology
            </Type.BodySmall>
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <SearchInput
          ref={inputRef}
          value={search}
          onChange={onSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Search plants, ailments, or conditions..."
          aria-label="Search plants, ailments, or conditions"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
        />
        {isOpen && (
          <div
            id={LISTBOX_ID}
            role="listbox"
            aria-label="Search results"
            className="absolute top-full left-0 right-0 mt-2 bg-glass-dense rounded-2xl overflow-hidden shadow-depth-xl z-20 animate-fade-in-down border-2 border-white/10"
          >
            {visiblePlants.map((plant, index) => (
              <div
                key={plant.id}
                id={optionId(plant.id)}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => {
                  navigate(`/plants/${plant.id}`)
                  onSearchChange('')
                  setActiveIndex(-1)
                }}
                className="w-full text-left px-5 py-3 flex justify-between items-center cursor-pointer transition-colors duration-100 border-b border-white/[0.04] hover:bg-white/[0.04] focus-visible:bg-white/[0.04] aria-selected:bg-white/[0.04]"
              >
                <div>
                  <span className="text-earth-100 text-sm">
                    {plant.common_name}
                  </span>
                  <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
                </div>
                <Badge variant={plant.category}>{plant.category}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
