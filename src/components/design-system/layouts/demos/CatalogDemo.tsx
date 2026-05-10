import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CatalogLayout from '../CatalogLayout'
import Text from '../../atoms/Text'
import Button from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'
import BrowseTile from '../../components/BrowseTile'

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

const CATEGORY_BADGE: Record<CatalogDemoItem['category'], string> = {
  conventional: 'badge-conventional',
  entheogenic: 'badge-entheogenic',
  both: 'badge-both',
}

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
        <span className="badge badge-conventional">{count}</span>
      </div>
      <p className="text-[11px] text-earth-500 mt-0.5">
        Catalog → Detail layout demo. Selecting an item routes to its own page — deep-linkable, real history.
      </p>
    </div>
  )
}

function DemoFilters({
  search,
  onSearch,
  category,
  onCategory,
  onClear,
  hasFilters,
}: {
  search: string
  onSearch: (value: string) => void
  category: string
  onCategory: (value: string) => void
  onClear: () => void
  hasFilters: boolean
}) {
  return (
    <div className="px-8 py-3">
      <div className="glass-panel bg-black/20 p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => onCategory(e.target.value)}
            className="select-field"
          >
            <option value="">All Categories</option>
            <option value="conventional">Conventional</option>
            <option value="entheogenic">Entheogenic</option>
            <option value="both">Both</option>
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-earth-400 hover:text-earth-100 transition-colors px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>
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
            <span className={`badge ${CATEGORY_BADGE[item.category]}`}>{item.category}</span>
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
      <div className="glass-panel bg-black/20 p-10 text-center">
        <p className="text-sm text-earth-500 mb-2">No items match your filters.</p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-botanical-400/80 hover:text-botanical-300 transition-colors"
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}

/**
 * Route-driven dedicated demo of `CatalogLayout`. Mounted at
 * `/design-system/layouts/catalog` with a `:id` sibling route. Composes
 * the layout exactly like a real feature would — selecting an item
 * navigates to its own full-page detail.
 */
export default function CatalogDemo() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CATALOG_DEMO_ITEMS.filter((item) => {
      if (category && item.category !== category) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.latin.toLowerCase().includes(q)
      )
    })
  }, [search, category])

  const hasFilters = Boolean(search) || Boolean(category)
  const clear = () => {
    setSearch('')
    setCategory('')
  }

  return (
    <CatalogLayout
      header={<DemoHeader count={filtered.length} />}
      filters={
        <DemoFilters
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onClear={clear}
          hasFilters={hasFilters}
        />
      }
      results={<DemoGrid items={filtered} />}
      empty={<DemoEmpty onClear={clear} />}
      itemCount={filtered.length}
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
        <span className={`badge ${CATEGORY_BADGE[item.category]}`}>{item.category}</span>
      </div>
      <p className="text-earth-500 italic mt-1 text-sm">{item.latin}</p>
      <p className="text-earth-300 text-sm mt-4 leading-relaxed">{item.summary}</p>
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-earth-500">
        Detail is its own route — refresh the page or share the URL and you land back here.
      </div>
    </article>
  )
}
