import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant } from '../../types'
import Text from '@/components/design-system/atoms/Text'
import ListDetailLayout from '@/components/design-system/layouts/ListDetailLayout'
import { INTEGRATION_PROTOCOLS } from './entheogenicProtocols'

function TopBar() {
  return (
    <div className="px-8 py-6">
      <Text.PageTitle className="text-gradient-celestial">Entheogenic Journey Guide</Text.PageTitle>
      <p className="text-sm text-earth-500 mt-1">
        Sacred plant medicine guidance: preparation, set & setting, and integration
      </p>

      <div
        className="glass-panel p-4 mt-4"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(16, 15, 12, 0.8))',
          border: '1px solid rgba(245, 158, 11, 0.08)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-sm text-amber-500/70 mt-0.5">⚠</span>
          <div>
            <p className="text-xs text-amber-300/80 font-display font-medium mb-0.5">Sacred Responsibility</p>
            <p className="text-[11px] text-earth-500 leading-relaxed">
              Entheogenic plants are powerful teachers that demand respect, preparation, and integration.
              This guide is for educational purposes. Many of these substances have legal restrictions.
              Always research local laws, work with experienced guides, and never combine with contraindicated medications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlantsList({ plants }: { plants: Plant[] }) {
  return (
    <div className="space-y-2">
      {plants.map((plant) => (
        <NavLink
          key={plant.id}
          to={`plants/${plant.id}`}
          className="block w-full text-left p-3.5 rounded-xl transition-all duration-200 ease-out-expo"
          style={({ isActive }) => ({
            background: isActive ? 'rgba(124, 94, 237, 0.1)' : 'rgba(26, 25, 21, 0.5)',
            border: isActive
              ? '1px solid rgba(124, 94, 237, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.04)',
            boxShadow: isActive ? '0 0 24px rgba(124, 94, 237, 0.08)' : undefined,
          })}
        >
          <div className="text-sm text-earth-200 font-medium">{plant.common_name}</div>
          <div className="text-xs text-earth-500 italic">{plant.latin_name}</div>
          <span className={`badge badge-${plant.category} mt-1.5`}>{plant.category}</span>
        </NavLink>
      ))}
    </div>
  )
}

function ProtocolsList() {
  return (
    <div className="space-y-2">
      {INTEGRATION_PROTOCOLS.map((protocol) => (
        <NavLink
          key={protocol.slug}
          to={`protocols/${protocol.slug}`}
          className="block w-full text-left p-3.5 rounded-xl transition-all duration-200 ease-out-expo"
          style={({ isActive }) => ({
            background: isActive ? 'rgba(93, 168, 126, 0.08)' : 'rgba(26, 25, 21, 0.5)',
            border: isActive
              ? '1px solid rgba(93, 168, 126, 0.15)'
              : '1px solid rgba(255, 255, 255, 0.04)',
            boxShadow: isActive ? '0 0 24px rgba(93, 168, 126, 0.06)' : undefined,
          })}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-50">{protocol.icon}</span>
            <span className="text-sm text-earth-200">{protocol.name}</span>
          </div>
          <div className="text-xs text-earth-500 mt-1 pl-6">{protocol.description}</div>
        </NavLink>
      ))}
    </div>
  )
}

function ListPane({ plants }: { plants: Plant[] }) {
  return (
    <div className="px-8 py-6 lg:pr-2">
      <Text.SectionLabel className="mb-3">Entheogenic Plants</Text.SectionLabel>
      <PlantsList plants={plants} />
      <Text.SectionLabel className="mt-6 mb-3">Journey Protocols</Text.SectionLabel>
      <ProtocolsList />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-16 py-16 text-earth-500 font-system">
      <p className="text-lg mb-2">Select a plant or protocol</p>
      <p className="text-sm">Choose an entheogenic plant to view its profile, or select a protocol for journey guidance.</p>
    </div>
  )
}

export default function EntheogenicGuide() {
  const [plants, setPlants] = useState<Plant[]>([])
  const detail = useOutlet()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    api.getPlants({ category: 'entheogenic' }).then((entheogenic) => {
      setPlants(entheogenic)
    })
    api.getPlants({ category: 'both' }).then((both) => {
      setPlants((prev) => [...prev, ...both])
    })
  }, [])

  return (
    <ListDetailLayout
      top={<TopBar />}
      list={<ListPane plants={plants} />}
      detail={detail}
      emptyDetail={<EmptyState />}
      onBack={() => navigate('/entheogens')}
      detailKey={pathname}
    />
  )
}
