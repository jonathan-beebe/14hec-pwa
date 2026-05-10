import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Section, Subsection } from '../primitives'
import ListDetailLayout from '../layouts/ListDetailLayout'
import CatalogLayout from '../layouts/CatalogLayout'
import { LIST_DETAIL_DEMO_ITEMS } from '../layouts/demos/ListDetailDemo'
import { CATALOG_DEMO_ITEMS, type CatalogDemoItem } from '../layouts/demos/CatalogDemo'
import Text from '../atoms/Text'

function DemoPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
      <p className="text-earth-500 text-[11px] uppercase tracking-[0.18em] font-system">
        Demo forthcoming
      </p>
    </div>
  )
}

const META_LABEL = 'uppercase tracking-[0.18em] text-earth-600'

function ListDetailDemoTop() {
  return (
    <div className="px-5 py-4 border-b border-white/5">
      <h4 className="text-base font-system font-semibold text-earth-100">Sample Botanicals</h4>
      <p className="text-[11px] text-earth-500 mt-0.5">A demonstration list — six items, routable detail.</p>
    </div>
  )
}

type DemoItem = (typeof LIST_DETAIL_DEMO_ITEMS)[number]

function ListDetailDemoList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ul className="p-2 space-y-1">
      {LIST_DETAIL_DEMO_ITEMS.map((item) => {
        const isActive = item.id === selectedId
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full text-left block px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-earth-900/60 text-earth-100'
                  : 'hover:bg-earth-900/30 text-earth-200'
              }`}
              aria-pressed={isActive}
            >
              <div className="text-sm">{item.name}</div>
              <div className="text-[11px] text-earth-500 italic">{item.latin}</div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function ListDetailDemoDetail({ item }: { item: DemoItem }) {
  return (
    <article className="p-6">
      <h4 className="text-2xl font-system font-bold text-earth-100">{item.name}</h4>
      <p className="text-earth-500 italic mt-1 text-sm">{item.latin}</p>
      <p className="text-earth-300 text-sm mt-4 leading-relaxed">{item.summary}</p>
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-earth-500">
        Detail content scrolls within the right column. The list keeps its own scroll on the left.
      </div>
    </article>
  )
}

function ListDetailDemoEmpty() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-earth-500 text-sm">Select an item from the list.</p>
    </div>
  )
}

function ListDetailDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedItem = LIST_DETAIL_DEMO_ITEMS.find((i) => i.id === selectedId) ?? null

  return (
    <div className="h-[560px] rounded-xl border border-white/5 overflow-hidden bg-earth-900/20">
      <ListDetailLayout
        top={<ListDetailDemoTop />}
        list={<ListDetailDemoList selectedId={selectedId} onSelect={setSelectedId} />}
        detail={selectedItem ? <ListDetailDemoDetail item={selectedItem} /> : null}
        emptyDetail={<ListDetailDemoEmpty />}
        onBack={() => setSelectedId(null)}
      />
    </div>
  )
}

const CATALOG_CATEGORY_BADGE: Record<CatalogDemoItem['category'], string> = {
  conventional: 'badge-conventional',
  entheogenic: 'badge-entheogenic',
  both: 'badge-both',
}

function CatalogDemoHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-4 pb-3">
      <Text.PageTitle>Sample Botanicals</Text.PageTitle>
      <span className="badge badge-conventional">{count}</span>
    </div>
  )
}

function CatalogDemoFilters({
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
    <div className="px-5 pb-3 pt-1">
      <div className="glass-panel p-3">
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

function CatalogDemoGrid({ items }: { items: CatalogDemoItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-5 pb-5">
      {items.map((item) => (
        <article key={item.id} className="card p-4 text-left group">
          <div className="flex justify-between items-start mb-1.5">
            <Text.CardTitle className="text-botanical-400 group-hover:text-botanical-300 transition-colors">
              {item.name}
            </Text.CardTitle>
            <span className={`badge ${CATALOG_CATEGORY_BADGE[item.category]}`}>{item.category}</span>
          </div>
          <p className="text-xs text-earth-500 italic mb-1.5">{item.latin}</p>
          <p className="text-xs text-earth-400 line-clamp-2">{item.summary}</p>
        </article>
      ))}
    </div>
  )
}

function CatalogDemoEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="px-5 pb-5">
      <div className="glass-panel p-10 text-center">
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

function CatalogDemo() {
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
    <div className="h-[560px] rounded-xl border border-white/5 overflow-hidden bg-earth-900/20">
      <CatalogLayout
        header={<CatalogDemoHeader count={filtered.length} />}
        filters={
          <CatalogDemoFilters
            search={search}
            onSearch={setSearch}
            category={category}
            onCategory={setCategory}
            onClear={clear}
            hasFilters={hasFilters}
          />
        }
        results={<CatalogDemoGrid items={filtered} />}
        empty={<CatalogDemoEmpty onClear={clear} />}
        itemCount={filtered.length}
      />
    </div>
  )
}

export default function LayoutsSection() {
  return (
    <Section id="layouts" title="Layouts">
      <Subsection title="Dashboard">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            An entry-point overview surfacing multiple data axes at once: stat
            tiles, navigation cards, featured items, quick-access lists.
            Composed as a bento-style grid of mixed-size cards.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Dashboard</code>
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>

      <Subsection title="Catalog → Detail">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            A large set of items, filterable and searchable in one view;
            selecting an item navigates to a dedicated full-page detail with
            back navigation. The list and the detail are separate routes —
            the list does not stay visible while viewing detail.
          </p>
          <p className="text-earth-300 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Use when:</span>{' '}
            the set is large enough to need filtering, items are homogeneous,
            and detail is rich enough to warrant its own page.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Plants</code>,{' '}
            <code className="text-earth-400">Ailments</code>,{' '}
            <code className="text-earth-400">Wellness</code>
          </p>
          <CatalogDemo />
          <div className="text-right">
            <Link
              to="/design-system/layouts/catalog"
              className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-earth-100 font-system transition-colors"
            >
              Open route-driven demo →
            </Link>
          </div>
        </div>
      </Subsection>

      <Subsection title="List + Detail">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            A scrollable list paired with a persistent detail pane. Selection
            updates the detail in place; no route change. The list is generic
            in shape (vertical scroll of similar items) — work happens by
            scanning down the list.
          </p>
          <p className="text-earth-300 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Use when:</span>{' '}
            the set is medium-sized (~10–50 items), items are homogeneous,
            and keeping the list visible while reading detail aids
            comparison.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Entheogens</code>,{' '}
            <code className="text-earth-400">My Collections</code>,{' '}
            <code className="text-earth-400">Doctrine Explorer</code>,{' '}
            <code className="text-earth-400">Body Systems</code> (grouped)
          </p>
          <ListDetailDemo />
          <div className="text-right">
            <Link
              to="/design-system/layouts/list-detail"
              className="inline-flex items-center gap-1 text-xs text-earth-400 hover:text-earth-100 font-system transition-colors"
            >
              Open route-driven demo →
            </Link>
          </div>
        </div>
      </Subsection>

      <Subsection title="Picker + Detail">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            A small, structured selector paired with a persistent detail
            pane. The picker's shape reflects the structure of the data — a
            quadrant, a calendar, a zodiac grid, an hourly clock, a small
            table — and is itself part of the visual language. Selection
            updates the detail in place.
          </p>
          <p className="text-earth-300 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Use when:</span>{' '}
            the set is small and fixed (typically ≤24 items), and the
            picker's arrangement carries domain meaning (compass directions,
            the four seasons, the seven planets, etc.).
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Preparations</code>,{' '}
            <code className="text-earth-400">Signs &amp; Planets</code>,{' '}
            <code className="text-earth-400">Planetary Timing</code>,{' '}
            <code className="text-earth-400">HMBS</code>,{' '}
            <code className="text-earth-400">Seasonal Guide</code>
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>

      <Subsection title="Other / Bespoke">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            Interactive tools that don't fit a browse-and-detail pattern:
            forms, CRUD applications, multi-axis query builders. Each is
            bespoke for now. A canonical pattern may emerge later (e.g. a
            shared form layout for natal-chart-style inputs) but is not
            pre-emptively designed.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Natal Chart</code> (form →
            results);{' '}
            <code className="text-earth-400">Plant Journal</code> (CRUD with
            list / view / edit modes);{' '}
            <code className="text-earth-400">Cross References</code>{' '}
            (faceted query builder)
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>
    </Section>
  )
}
