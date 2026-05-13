import { useMemo } from 'react'
import CatalogLayout from '../CatalogLayout'
import Badge from '../../atoms/Badge'
import BrowseTile from '../../components/BrowseTile'
import CatalogHeader from '../../components/CatalogHeader'
import {
  CatalogGrid,
  CatalogGroup,
  CatalogGroupedResults,
} from '../../components/CatalogGrid'
import CatalogEmpty from '../../components/CatalogEmpty'
import FilterBar from '../../components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '../../hooks/useCollectionFilters'
import { formatCatalogStatus } from '../../utils/formatCatalogStatus'
import {
  CATALOG_DEMO_ITEMS,
  filterDemoItems,
  type CatalogDemoItem,
} from './CatalogDemo'

const GROUPED_FILTERS: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search by name…', label: 'Search' },
]

const CATEGORY_HEADINGS: Record<CatalogDemoItem['category'], string> = {
  conventional: 'Conventional',
  entheogenic: 'Entheogenic',
  both: 'Both',
}

const CATEGORY_ORDER: CatalogDemoItem['category'][] = [
  'conventional',
  'both',
  'entheogenic',
]

function groupByCategory(
  items: CatalogDemoItem[],
): Map<CatalogDemoItem['category'], CatalogDemoItem[]> {
  const map = new Map<CatalogDemoItem['category'], CatalogDemoItem[]>()
  for (const cat of CATEGORY_ORDER) map.set(cat, [])
  for (const item of items) {
    const bucket = map.get(item.category)
    if (bucket) bucket.push(item)
  }
  return map
}

/**
 * Second canonical reference for `CatalogLayout`. Exercises the
 * grouped-results variant — `CatalogGroupedResults` + `CatalogGroup`
 * + `CatalogGrid` — so feature catalogs whose data is naturally
 * bucketed (ailments by body system, body systems by category) have
 * a worked example to follow.
 *
 * Mounted at `/design-system/layouts/catalog-grouped`. Filter state
 * lives in the URL via `useCollectionFilters`, same as the flat demo;
 * grouping is purely a presentation step over the filtered list.
 */
export default function CatalogGroupedDemo() {
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(GROUPED_FILTERS)
  const filtered = useMemo(() => filterDemoItems(values), [values])
  const grouped = useMemo(() => groupByCategory(filtered), [filtered])
  const statusMessage = formatCatalogStatus(
    filtered.length,
    CATALOG_DEMO_ITEMS.length,
    hasActiveFilters,
    { noun: 'item' },
  )

  return (
    <CatalogLayout
      header={
        <CatalogHeader
          title="Botanicals by Category"
          count={filtered.length}
          total={CATALOG_DEMO_ITEMS.length}
          backTo={{ to: '/design-system', label: 'Back to catalog' }}
          subtitle="Grouped-results variant. Items live in a flat dataset; grouping is presentation only."
        />
      }
      filters={
        <div className="px-8 py-3">
          <FilterBar
            filters={GROUPED_FILTERS}
            values={values}
            onChange={setValue}
            onClear={clear}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      }
      results={
        <CatalogGroupedResults>
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? []
            if (items.length === 0) return null
            return (
              <CatalogGroup
                key={cat}
                heading={`${CATEGORY_HEADINGS[cat]} (${items.length})`}
              >
                <CatalogGrid>
                  {items.map((item) => (
                    <BrowseTile key={item.id} to={`/design-system/layouts/catalog/${item.id}`}>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-sm font-medium text-earth-100">
                          {item.name}
                        </span>
                        <Badge variant={item.category}>{item.category}</Badge>
                      </div>
                      <p className="text-xs text-earth-500 italic mb-1.5">
                        {item.latin}
                      </p>
                      <p className="text-xs text-earth-400 line-clamp-2">
                        {item.summary}
                      </p>
                    </BrowseTile>
                  ))}
                </CatalogGrid>
              </CatalogGroup>
            )
          })}
        </CatalogGroupedResults>
      }
      empty={
        <CatalogEmpty message="No items match your filters." onClear={clear} />
      }
      itemCount={filtered.length}
      statusMessage={statusMessage}
    />
  )
}
