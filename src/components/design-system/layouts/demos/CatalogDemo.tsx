import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CatalogLayout from '../CatalogLayout'
import Text from '../../atoms/Text'
import Button from '../../atoms/Button'
import Badge from '../../atoms/Badge'
import { Icon } from '../../atoms/Icon'
import BrowseTile from '../../components/BrowseTile'
import CatalogHeader from '../../components/CatalogHeader'
import { CatalogGrid } from '../../components/CatalogGrid'
import CatalogEmpty from '../../components/CatalogEmpty'
import FilterBar from '../../components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '../../hooks/useCollectionFilters'
import { formatCatalogStatus } from '../../utils/formatCatalogStatus'

export interface CatalogDemoItem {
  id: string
  name: string
  latin: string
  category: 'conventional' | 'entheogenic' | 'both'
  summary: string
}

export const CATALOG_DEMO_ITEMS: readonly CatalogDemoItem[] = [
  { id: 'rosemary',   name: 'Rosemary',   latin: 'Salvia rosmarinus',     category: 'conventional', summary: 'Memory, circulation, sun-aligned. A perennial guardian of clarity.' },
  { id: 'lavender',   name: 'Lavender',   latin: 'Lavandula angustifolia', category: 'conventional', summary: 'Calm, sleep, mercurial. Soothes a restless nervous system.' },
  { id: 'mugwort',    name: 'Mugwort',    latin: 'Artemisia vulgaris',     category: 'both',         summary: 'Dream, threshold, lunar. Carries one across edges.' },
  { id: 'tulsi',      name: 'Tulsi',      latin: 'Ocimum sanctum',         category: 'conventional', summary: 'Adaptogen, clarity, devotional. Holy basil of the heart.' },
  { id: 'yarrow',     name: 'Yarrow',     latin: 'Achillea millefolium',   category: 'conventional', summary: 'Boundary, blood, martial. Closes what is open and opens what is closed.' },
  { id: 'nettle',     name: 'Nettle',     latin: 'Urtica dioica',          category: 'conventional', summary: 'Mineral nourishment, kidney support. Stings, then feeds.' },
  { id: 'datura',     name: 'Datura',     latin: 'Datura stramonium',      category: 'entheogenic',  summary: 'Threshold plant of the witches. Approached only with rigor.' },
  { id: 'syrian-rue', name: 'Syrian Rue', latin: 'Peganum harmala',        category: 'entheogenic',  summary: 'MAOI ally; visionary architecture. The harmala alkaloid carrier.' },
  { id: 'cacao',      name: 'Cacao',      latin: 'Theobroma cacao',        category: 'both',         summary: 'Heart-opening stimulant. Ceremonial in tradition, daily in habit.' },
  { id: 'chamomile',  name: 'Chamomile',  latin: 'Matricaria chamomilla',  category: 'conventional', summary: 'Apple of the earth. Quiets the gut and the nerves alike.' },
  { id: 'sage',       name: 'Sage',       latin: 'Salvia officinalis',     category: 'conventional', summary: 'Wisdom and astringency. Dries, clears, lengthens.' },
  { id: 'kava',       name: 'Kava',       latin: 'Piper methysticum',      category: 'both',         summary: 'Pacific peace plant. Relaxes the body without dulling the mind.' },
] as const

export const DEMO_FILTERS: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search by name…', label: 'Search' },
  {
    kind: 'select',
    key: 'category',
    label: 'Category',
    options: [
      { value: '', label: 'All Categories' },
      { value: 'conventional', label: 'Conventional' },
      { value: 'entheogenic', label: 'Entheogenic' },
      { value: 'both', label: 'Both' },
    ],
  },
]

function DemoHeader({ count }: { count: number }) {
  return (
    <CatalogHeader
      title="Sample Botanicals"
      count={count}
      backTo={{ to: '/design-system', label: 'Back to catalog' }}
      subtitle="Catalog → Detail layout demo. Selecting an item routes to its own page — deep-linkable, real history."
    />
  )
}

function DemoGrid({ items }: { items: CatalogDemoItem[] }) {
  return (
    <CatalogGrid>
      {items.map((item) => (
        <BrowseTile key={item.id} to={item.id}>
          <div className="flex justify-between items-start mb-1.5">
            <span className="text-sm font-medium text-earth-100">{item.name}</span>
            <Badge variant={item.category}>{item.category}</Badge>
          </div>
          <p className="text-xs text-earth-500 italic mb-1.5">{item.latin}</p>
          <p className="text-xs text-earth-400 line-clamp-2">{item.summary}</p>
        </BrowseTile>
      ))}
    </CatalogGrid>
  )
}

function DemoEmpty({ onClear }: { onClear: () => void }) {
  return (
    <CatalogEmpty message="No items match your filters." onClear={onClear} />
  )
}

export function filterDemoItems(
  values: Record<string, string>,
): CatalogDemoItem[] {
  const q = (values.q ?? '').trim().toLowerCase()
  const category = values.category ?? ''
  return CATALOG_DEMO_ITEMS.filter((item) => {
    if (category && item.category !== category) return false
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.latin.toLowerCase().includes(q)
    )
  })
}


/**
 * Route-driven dedicated demo of `CatalogLayout`. Mounted at
 * `/design-system/layouts/catalog` with a `:id` sibling route. Composes
 * the layout exactly like a real feature would: filter state lives in the
 * URL via `useCollectionFilters`, the bar comes from `FilterBar`, and
 * selecting an item navigates to its own full-page detail.
 */
export default function CatalogDemo() {
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(DEMO_FILTERS)
  const filtered = useMemo(() => filterDemoItems(values), [values])
  const statusMessage = formatCatalogStatus(
    filtered.length,
    CATALOG_DEMO_ITEMS.length,
    hasActiveFilters,
    { noun: 'item' },
  )

  return (
    <CatalogLayout
      header={<DemoHeader count={filtered.length} />}
      filters={
        <div className="px-4 md:px-8 py-3">
          <FilterBar
            filters={DEMO_FILTERS}
            values={values}
            onChange={setValue}
            onClear={clear}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      }
      results={<DemoGrid items={filtered} />}
      empty={<DemoEmpty onClear={clear} />}
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}

export function CatalogDemoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const item = CATALOG_DEMO_ITEMS.find((i) => i.id === id)

  if (!item) {
    return (
      <div className="animate-fade-in px-8 py-6">
        <Button.Ghost onClick={() => navigate('..', { relative: 'path' })} className="mb-4">
          <Icon.ArrowLeft className="mr-1.5" /> Back
        </Button.Ghost>
        <p className="text-earth-500 text-sm">Not found.</p>
      </div>
    )
  }

  return (
    <article className="animate-fade-in px-8 py-6">
      <Button.Ghost onClick={() => navigate('..', { relative: 'path' })} className="mb-4">
        <Icon.ArrowLeft className="mr-1.5" /> Back
      </Button.Ghost>
      <div className="flex items-center gap-3">
        <Text.PageTitle>{item.name}</Text.PageTitle>
        <Badge variant={item.category}>{item.category}</Badge>
      </div>
      <p className="text-earth-500 italic mt-1 text-sm">{item.latin}</p>
      <p className="text-earth-300 text-sm mt-4 leading-relaxed">{item.summary}</p>
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-earth-500">
        Detail is its own route — refresh the page or share the URL and you land back here.
      </div>
    </article>
  )
}
