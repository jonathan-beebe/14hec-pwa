import { useEffect, useState } from 'react'
import { useLocation, useMatch, useOutlet } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant } from '../../types'
import Badge from '@/components/design-system/atoms/Badge'
import Type from '@/components/design-system/atoms/Type'
import FlatListRow from '@/components/design-system/components/FlatListRow'
import Notice from '@/components/design-system/components/Notice'
import ListDetailLayout from '@/components/design-system/layouts/ListDetailLayout'
import { usePageMeta } from '@/components/layout/MobileTopBar'
import { INTEGRATION_PROTOCOLS } from './entheogenicProtocols'

const PLANT_TINT = '#7c5eed' // celestial purple — sacred / mystical
const PROTOCOL_TINT = '#5da87e' // botanical green — grounded / practical

function TopBar() {
  return (
    <div className="px-8 py-6 space-y-4">
      <div>
        <Type.Branded.PageTitle className="text-gradient-celestial">
          Entheogenic Journey Guide
        </Type.Branded.PageTitle>
        <Type.BodySmall className="mt-1 text-earth-500">
          Sacred plant medicine guidance: preparation, set & setting, and
          integration
        </Type.BodySmall>
      </div>
      <Notice title="Sacred Responsibility">
        Entheogenic plants are powerful teachers that demand respect,
        preparation, and integration. This guide is for educational purposes.
        Many of these substances have legal restrictions. Always research
        local laws, work with experienced guides, and never combine with
        contraindicated medications.
      </Notice>
    </div>
  )
}

function PlantsList({
  plants,
  selectedId,
}: {
  plants: Plant[]
  selectedId: string | null
}) {
  return (
    <ul>
      {plants.map((plant) => (
        <li key={plant.id}>
          <FlatListRow
            to={`plants/${plant.id}`}
            selected={String(plant.id) === selectedId}
            tintHex={PLANT_TINT}
            primary={plant.common_name}
            secondary={
              <>
                <span className="italic">{plant.latin_name}</span>
                {' · '}
                <Badge variant={plant.category}>{plant.category}</Badge>
              </>
            }
            aria-label={`${plant.common_name} — ${plant.latin_name}`}
          />
        </li>
      ))}
    </ul>
  )
}

function ProtocolsList({ selectedSlug }: { selectedSlug: string | null }) {
  return (
    <ul>
      {INTEGRATION_PROTOCOLS.map((protocol) => (
        <li key={protocol.slug}>
          <FlatListRow
            to={`protocols/${protocol.slug}`}
            selected={protocol.slug === selectedSlug}
            tintHex={PROTOCOL_TINT}
            primary={protocol.name}
            secondary={protocol.description}
          />
        </li>
      ))}
    </ul>
  )
}

function ListPane({
  plants,
  selectedPlantId,
  selectedProtocolSlug,
}: {
  plants: Plant[]
  selectedPlantId: string | null
  selectedProtocolSlug: string | null
}) {
  return (
    <div className="py-6 lg:pr-2">
      <Type.SectionLabel className="px-8 mb-3">
        Entheogenic Plants
      </Type.SectionLabel>
      <PlantsList plants={plants} selectedId={selectedPlantId} />
      <Type.SectionLabel className="px-8 mt-6 mb-3">
        Journey Protocols
      </Type.SectionLabel>
      <ProtocolsList selectedSlug={selectedProtocolSlug} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-16 py-16 text-earth-500 font-system">
      <p className="text-lg mb-2">Select a plant or protocol</p>
      <p className="text-sm">
        Choose an entheogenic plant to view its profile, or select a protocol
        for journey guidance.
      </p>
    </div>
  )
}

export default function EntheogenicGuide() {
  const [plants, setPlants] = useState<Plant[]>([])
  const detail = useOutlet()
  const { pathname, search } = useLocation()
  const plantMatch = useMatch('/entheogens/plants/:id')
  const protocolMatch = useMatch('/entheogens/protocols/:slug')
  const selectedPlantId = plantMatch?.params.id ?? null
  const selectedProtocolSlug = protocolMatch?.params.slug ?? null

  // Preserve any active search params on the back path so a filter (or
  // any future URL state) survives the trip back from detail.
  usePageMeta({
    title: 'Entheogens',
    back: detail ? `/entheogens${search}` : null,
  })

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
      list={
        <ListPane
          plants={plants}
          selectedPlantId={selectedPlantId}
          selectedProtocolSlug={selectedProtocolSlug}
        />
      }
      detail={detail}
      emptyDetail={<EmptyState />}
      detailKey={pathname}
    />
  )
}
