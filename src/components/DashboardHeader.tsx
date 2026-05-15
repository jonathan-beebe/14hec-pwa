import { useNavigate } from 'react-router-dom'
import Type from '@/components/design-system/atoms/Type'
import SearchInput from '@/components/design-system/atoms/SearchInput'
import type { Plant } from '@/types'

interface DashboardHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filteredPlants: Plant[]
}

export default function DashboardHeader({
  search,
  onSearchChange,
  filteredPlants,
}: DashboardHeaderProps) {
  const navigate = useNavigate()

  return (
    <div
      className="relative overflow-visible rounded-3xl p-8 mb-8"
      style={{
        background: '#000',
        border: '1px solid rgba(0, 0, 0, 1)',
        boxShadow:`
          inset 0 -1px 0 0 rgba(255,255,255,0.1),
          inset 0 1px 0 0 rgba(255,255,255,0.1), 
          rgba(0, 0, 0, 1) 0px 2px 8px -4px, 
          rgba(0, 0, 0, 0.6) 0px 6px 24px -12px, 
          rgba(0, 0, 0, 0.4) 0px 18px 40px -20px
        `,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="hero-orb w-96 h-96 -top-48 right-0" style={{ background: '#82c8a0', filter: 'blur(100px)', opacity: 0.14 }} />
        <div className="hero-orb w-72 h-72 -bottom-36 -left-24" style={{ background: '#b8a0ff', filter: 'blur(100px)', opacity: 0.12 }} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-1 h-12 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #82c8a0, #b8a0ff)' }}
          />
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
          value={search}
          onChange={onSearchChange}
          placeholder="Search plants, ailments, or conditions..."
          aria-label="Search plants, ailments, or conditions"
        />
        {search && filteredPlants.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-glass-dense rounded-2xl overflow-hidden shadow-depth-xl z-20 animate-fade-in-down"
            style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            {filteredPlants.slice(0, 5).map((plant) => (
              <button
                key={plant.id}
                onClick={() => navigate(`/plants/${plant.id}`)}
                className="w-full text-left px-5 py-3 flex justify-between items-center group transition-colors duration-100"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div>
                  <span className="text-earth-100 group-hover:text-botanical-400 transition-colors text-sm">
                    {plant.common_name}
                  </span>
                  <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
                </div>
                <span className={`badge badge-${plant.category}`}>{plant.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
