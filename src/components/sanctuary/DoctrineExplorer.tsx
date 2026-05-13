import { useEffect, useMemo, useState } from 'react'
import { useLocation, useMatch, useOutlet } from 'react-router-dom'
import { api } from '@/data/api'
import type { PlantTeachingWithPlant } from '@/types'
import Badge, { type BadgeVariant } from '@/components/design-system/atoms/Badge'
import Type from '@/components/design-system/atoms/Type'
import FilterBar from '@/components/design-system/components/FilterBar'
import FlatListRow from '@/components/design-system/components/FlatListRow'
import Notice from '@/components/design-system/components/Notice'
import ListDetailLayout from '@/components/design-system/layouts/ListDetailLayout'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '@/components/design-system/hooks/useCollectionFilters'
import { usePageMeta } from '@/components/layout/MobileTopBar'

const DOCTRINE_TINT = '#d97706' // amber-600 — the doctrine voice

function buildFilters(teachings: PlantTeachingWithPlant[]): CatalogFilter[] {
  const cats = new Set(teachings.map((t) => t.category))
  return [
    { kind: 'search', key: 'q', placeholder: 'Search plants…', label: 'Search' },
    {
      kind: 'select',
      key: 'category',
      label: 'Category',
      options: [
        { value: '', label: 'All categories' },
        ...Array.from(cats)
          .sort()
          .map((c) => ({
            value: c,
            label: c.charAt(0).toUpperCase() + c.slice(1),
          })),
      ],
    },
  ]
}

function filterTeachings(
  values: Record<string, string>,
  teachings: PlantTeachingWithPlant[],
) {
  const q = (values.q ?? '').trim().toLowerCase()
  const category = values.category ?? ''
  return teachings.filter((t) => {
    if (category && t.category !== category) return false
    if (!q) return true
    return (
      t.common_name.toLowerCase().includes(q) ||
      t.latin_name.toLowerCase().includes(q)
    )
  })
}

function TopBar() {
  return (
    <div className="px-8 py-6 space-y-4">
      <div>
        <Type.Branded.PageTitle className="text-gradient-gold">
          Doctrine of Plant Teachings
        </Type.Branded.PageTitle>
        <Type.BodySmall className="mt-1 text-earth-500">
          What each plant activates within you — energetic, mental, physical,
          and spiritual teachings.
        </Type.BodySmall>
      </div>
      <Notice tone="info" icon="❝">
        <em className="not-italic">
          "Plants activate what is already within us. They are mirrors and
          catalysts, not additions."
        </em>{' '}
        Every teaching here reflects the truth that your body, mind, and
        spirit already contain everything they need. Plants simply remind
        you.
      </Notice>
    </div>
  )
}

function FiltersBar({
  filters,
  values,
  setValue,
  clear,
  hasActiveFilters,
}: {
  filters: CatalogFilter[]
  values: Record<string, string>
  setValue: (key: string, value: string) => void
  clear: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="px-4 md:px-8 py-3 bg-earth-950/60 backdrop-blur-md">
      <FilterBar
        filters={filters}
        values={values}
        onChange={setValue}
        onClear={clear}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}

function ListPane({
  teachings,
  selectedPlantId,
}: {
  teachings: PlantTeachingWithPlant[]
  selectedPlantId: string | null
}) {
  if (teachings.length === 0) {
    return (
      <div className="px-8 py-6 text-center">
        <Type.Caption>No plants match your search.</Type.Caption>
      </div>
    )
  }

  return (
    <ul>
      {teachings.map((t) => (
        <li key={t.id}>
          <FlatListRow
            to={String(t.plant_id)}
            selected={String(t.plant_id) === selectedPlantId}
            tintHex={DOCTRINE_TINT}
            primary={t.common_name}
            secondary={
              <>
                <span className="italic">{t.latin_name}</span>
                {' · '}
                <Badge variant={t.category as BadgeVariant}>
                  {t.category}
                </Badge>
              </>
            }
            aria-label={`${t.common_name} — ${t.latin_name}`}
          />
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="px-16 py-16 text-earth-500 font-system">
      <Type.Subheading className="mb-2">
        Select a plant teaching
      </Type.Subheading>
      <Type.BodySmall>
        Discover what each plant activates within you across four dimensions
        of being.
      </Type.BodySmall>
    </div>
  )
}

export default function DoctrineExplorer() {
  const [teachings, setTeachings] = useState<PlantTeachingWithPlant[]>([])
  const detail = useOutlet()
  const { pathname } = useLocation()
  const plantMatch = useMatch('/doctrine/:plantId')
  const selectedPlantId = plantMatch?.params.plantId ?? null

  usePageMeta({
    title: 'Doctrine',
    back: detail ? '/doctrine' : null,
  })

  useEffect(() => {
    api.getAllTeachings().then(setTeachings)
  }, [])

  const filterConfig = useMemo(() => buildFilters(teachings), [teachings])
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(filterConfig)
  const filtered = useMemo(
    () => filterTeachings(values, teachings),
    [values, teachings],
  )

  return (
    <ListDetailLayout
      top={<TopBar />}
      filters={
        <FiltersBar
          filters={filterConfig}
          values={values}
          setValue={setValue}
          clear={clear}
          hasActiveFilters={hasActiveFilters}
        />
      }
      list={
        <ListPane teachings={filtered} selectedPlantId={selectedPlantId} />
      }
      detail={detail}
      emptyDetail={<EmptyState />}
      detailKey={pathname}
    />
  )
}
