import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CatalogLayout from '../CatalogLayout'
import Text from '../../atoms/Text'
import Button from '../../atoms/Button'
import Badge from '../../atoms/Badge'
import { Icon } from '../../atoms/Icon'
import BrowseTile from '../../components/BrowseTile'
import FilterBar from '../../components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '../../hooks/useCollectionFilters'

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
    <div className="px-8 pt-6 pb-4">
      <Link
        to="/design-system"
        className="text-[11px] text-earth-500 hover:text-earth-200 transition-colors"
      >
        ← Back to catalog
      </Link>
      <div className="flex items-center gap-3 mt-1">
        <Text.PageTitle>Sample Botanicals</Text.PageTitle>
        <Badge.Conventional>{count}</Badge.Conventional>
      </div>
      <p className="text-[11px] text-earth-500 mt-0.5">
        Catalog → Detail layout demo. Selecting an item routes to its own page — deep-linkable, real history.
      </p>
    </div>
  )
}

function DemoGrid({ items }: { items: CatalogDemoItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-8 pt-3 pb-8">
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
    </div>
  )
}

function DemoEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="px-8 pt-3 pb-8">
      <div className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/[0.06] p-10 text-center">
        <p className="text-sm text-earth-500 mb-2">No items match your filters.</p>
        <button
          type="button"
          onClick={onClear}
          className={
            'text-xs text-botanical-400/80 hover:text-botanical-300 ' +
            'rounded-md px-2 py-1.5 ' +
            'focus:outline-none ' +
            'focus-visible:ring-2 focus-visible:ring-botanical-400/60 ' +
            'transition-colors'
          }
        >
          Clear filters
        </button>
      </div>
    </div>
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

function statusFor(count: number, total: number, hasActiveFilters: boolean) {
  const noun = total === 1 ? 'item' : 'items'
  if (!hasActiveFilters) return `${count} ${noun}`
  if (count === 0) return 'No items match your filters'
  return `${count} of ${total} ${noun} match your filters`
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
  const statusMessage = statusFor(
    filtered.length,
    CATALOG_DEMO_ITEMS.length,
    hasActiveFilters,
  )

  return (
    <CatalogLayout
      header={<DemoHeader count={filtered.length} />}
      filters={
        <div className="px-8 py-3">
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
