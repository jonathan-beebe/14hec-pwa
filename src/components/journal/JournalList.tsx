import { useEffect, useMemo, useState } from 'react'
import { api } from '@/data/api'
import type { JournalEntry, Plant } from '@/types'
import Button from '@/components/design-system/atoms/Button'
import BrowseTile from '@/components/design-system/components/BrowseTile'
import CatalogLayout from '@/components/design-system/layouts/CatalogLayout'
import CatalogHeader from '@/components/design-system/components/CatalogHeader'
import { CatalogGrid } from '@/components/design-system/components/CatalogGrid'
import CatalogEmpty from '@/components/design-system/components/CatalogEmpty'
import FilterBar from '@/components/design-system/components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '@/components/design-system/hooks/useCollectionFilters'
import { formatCatalogStatus } from '@/components/design-system/utils/formatCatalogStatus'

const MOOD_ICONS: Record<string, string> = {
  grateful: '♡',
  curious: '☉',
  peaceful: '☘',
  energized: '✦',
  reflective: '☽',
  challenged: '☸',
  transformed: '✧',
}

const MOOD_COLORS: Record<string, string> = {
  grateful: 'rgba(244, 63, 94, 0.7)',
  curious: 'rgba(59, 130, 246, 0.7)',
  peaceful: 'rgba(61, 138, 94, 0.7)',
  energized: 'rgba(251, 191, 36, 0.7)',
  reflective: 'rgba(124, 94, 237, 0.7)',
  challenged: 'rgba(245, 158, 11, 0.7)',
  transformed: 'rgba(168, 85, 247, 0.7)',
}

const SORT_OPTIONS = [
  { value: '', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'By title' },
]

function buildFilters(plants: Plant[]): CatalogFilter[] {
  return [
    { kind: 'search', key: 'q', placeholder: 'Search journal entries…', label: 'Search' },
    {
      kind: 'select',
      key: 'plant',
      label: 'Plant',
      options: [
        { value: '', label: 'All plants' },
        ...plants.map((p) => ({ value: String(p.id), label: p.common_name })),
      ],
    },
    { kind: 'select', key: 'sort', label: 'Sort', options: SORT_OPTIONS },
  ]
}

function filterEntries(
  values: Record<string, string>,
  entries: JournalEntry[],
): JournalEntry[] {
  const q = (values.q ?? '').trim().toLowerCase()
  const plantId = values.plant ? Number(values.plant) : null
  const sort = values.sort ?? ''

  let result = entries.filter((e) => {
    if (plantId !== null && e.plant_id !== plantId) return false
    if (!q) return true
    return (
      (e.title ?? '').toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (e.plant_name ?? '').toLowerCase().includes(q)
    )
  })

  if (sort === 'oldest') {
    result = [...result].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  } else if (sort === 'title') {
    result = [...result].sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? ''),
    )
  } else {
    result = [...result].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  return result
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [plants, setPlants] = useState<Plant[]>([])

  const filterConfig = useMemo(() => buildFilters(plants), [plants])
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(filterConfig)

  useEffect(() => {
    api.getJournalEntries().then(setEntries)
    api.getPlants().then(setPlants)
  }, [])

  const filtered = useMemo(
    () => filterEntries(values, entries),
    [values, entries],
  )
  const statusMessage = formatCatalogStatus(
    filtered.length,
    entries.length,
    hasActiveFilters,
    { noun: 'journal entry', nounPlural: 'journal entries' },
  )

  const empty = hasActiveFilters ? (
    <CatalogEmpty
      message="No journal entries match your filters."
      onClear={clear}
    />
  ) : (
    <CatalogEmpty
      message="Your journal awaits its first entry. Begin your record of plant relationships and inner exploration."
      actions={
        <Button.Primary route="/journal/new">Write your first entry</Button.Primary>
      }
    />
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="Journal"
          count={hasActiveFilters ? filtered.length : undefined}
          total={hasActiveFilters ? entries.length : undefined}
          subtitle="Reflections on plants, practice, and what they reveal."
          actions={
            <Button.Primary route="/journal/new">+ New entry</Button.Primary>
          }
        />
      }
      filters={
        <div className="px-8 py-3">
          <FilterBar
            filters={filterConfig}
            values={values}
            onChange={setValue}
            onClear={clear}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      }
      results={
        <CatalogGrid>
          {filtered.map((entry) => (
            <BrowseTile key={entry.id} to={`/journal/${entry.id}`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-medium text-earth-100 truncate">
                  {entry.title || 'Untitled entry'}
                </span>
                {entry.mood && (
                  <span
                    className="text-xs flex-shrink-0"
                    style={{
                      color:
                        MOOD_COLORS[entry.mood] || 'rgba(255,255,255,0.4)',
                    }}
                    title={entry.mood}
                  >
                    {MOOD_ICONS[entry.mood] || '○'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] text-earth-500">
                  {formatDateShort(entry.created_at)}
                </span>
                {entry.plant_name && (
                  <>
                    <span className="text-earth-700 text-[10px]">·</span>
                    <span className="text-[10px] text-botanical-500">
                      {entry.plant_name}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-earth-400 line-clamp-2 leading-relaxed">
                {entry.content.slice(0, 160)}
                {entry.content.length > 160 ? '…' : ''}
              </p>
            </BrowseTile>
          ))}
        </CatalogGrid>
      }
      empty={empty}
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}
