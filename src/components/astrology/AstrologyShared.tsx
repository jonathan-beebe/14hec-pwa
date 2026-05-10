import { useNavigate } from 'react-router-dom'
import type { Plant } from '@/types'
import Text from '@/components/design-system/atoms/Text'

// PlanetTile reserves a 180px icon slot, so the list column needs a
// floor wide enough to keep the text from getting squeezed.
export const ASTROLOGY_LIST_WIDTH = 'lg:min-w-[400px]'

export const slug = (name: string) => name.toLowerCase()

export function ColorChip({ name, hex }: { name: string; hex: string }) {
  return (
    <span
      className="badge"
      style={{
        background: `${hex}1A`,
        boxShadow: `inset 0 0 0 1px ${hex}40`,
        color: '#e7e5e4',
      }}
    >
      <span
        aria-hidden="true"
        className="w-2 h-2 rounded-full mr-1.5 inline-block ring-1 ring-inset ring-white/20"
        style={{ background: hex }}
      />
      {name}
    </span>
  )
}

export function DetailFact({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-xl p-3 ${className ?? ''}`}
      style={{
        background: 'rgba(36, 34, 30, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <Text.SectionLabel>{label}</Text.SectionLabel>
      <div className="text-earth-200 text-sm">{children}</div>
    </div>
  )
}

export function AssociatedPlants({ plants }: { plants: Plant[] }) {
  const navigate = useNavigate()
  return (
    <div>
      <Text.SectionLabel>Associated Plants</Text.SectionLabel>
      <div className="space-y-2">
        {plants.map((plant) => (
          <button
            key={plant.id}
            onClick={() => navigate(`/plants/${plant.id}`)}
            className="w-full text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
            style={{
              background: 'rgba(36, 34, 30, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background =
                'rgba(36, 34, 30, 0.65)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background =
                'rgba(36, 34, 30, 0.4)'
            }}
          >
            <span className="text-botanical-400 group-hover:text-botanical-300 transition-colors">
              {plant.common_name}
            </span>
            <span className="text-earth-500 text-sm ml-2 italic">
              {plant.latin_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
