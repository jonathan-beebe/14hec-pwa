import { useMemo } from 'react'
import { Icon } from '../atoms/Icon'
import SearchInput from '../atoms/SearchInput'
import Select from '../atoms/Select'
import type {
  CatalogFilter,
  SearchFilter,
  SelectFilter,
} from '../hooks/useCollectionFilters'

export interface FilterBarProps {
  filters: CatalogFilter[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
  className?: string
}

interface AppliedChip {
  key: string
  filterLabel: string
  valueLabel: string
}

function chipFromFilter(
  filter: CatalogFilter,
  value: string,
): AppliedChip | null {
  if (!value) return null
  if (filter.kind === 'search') {
    return {
      key: filter.key,
      filterLabel: filter.label ?? filter.placeholder ?? 'Search',
      valueLabel: value,
    }
  }
  const option = filter.options.find((o) => o.value === value)
  if (!option) return null
  return {
    key: filter.key,
    filterLabel: filter.label,
    valueLabel: option.label,
  }
}

function renderControl(
  filter: CatalogFilter,
  value: string,
  onChange: (key: string, value: string) => void,
) {
  if (filter.kind === 'search') {
    return (
      <SearchControl
        key={filter.key}
        filter={filter}
        value={value}
        onChange={onChange}
      />
    )
  }
  return (
    <SelectControl
      key={filter.key}
      filter={filter}
      value={value}
      onChange={onChange}
    />
  )
}

function SearchControl({
  filter,
  value,
  onChange,
}: {
  filter: SearchFilter
  value: string
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="flex-1 min-w-[180px]">
      <SearchInput
        value={value}
        onChange={(next) => onChange(filter.key, next)}
        placeholder={filter.placeholder}
        aria-label={filter.label ?? filter.placeholder ?? 'Search'}
      />
    </div>
  )
}

function SelectControl({
  filter,
  value,
  onChange,
}: {
  filter: SelectFilter
  value: string
  onChange: (key: string, value: string) => void
}) {
  return (
    <Select
      label={filter.label}
      options={filter.options}
      value={value}
      onChange={(next) => onChange(filter.key, next)}
    />
  )
}

/**
 * Canonical filter bar for Catalog views (design-system Rule #9). Composes
 * `SearchInput` + `Select` atoms from a typed filter config. Pure
 * presentation — state lives in `useCollectionFilters` so the bar can be
 * driven by URL params, local state, or anything else with the same shape.
 *
 * Renders applied-filter chips beneath the controls when at least one
 * filter is active; each chip can be dismissed individually, and the
 * trailing Clear action resets every filter at once.
 */
export default function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  hasActiveFilters,
  className,
}: FilterBarProps) {
  const chips = useMemo(() => {
    const result: AppliedChip[] = []
    for (const f of filters) {
      const chip = chipFromFilter(f, values[f.key] ?? '')
      if (chip) result.push(chip)
    }
    return result
  }, [filters, values])

  const wrapperClass = [
    'rounded-xl bg-black/20 backdrop-blur-md border border-white/[0.06] p-3',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClass}>
      <div className="flex flex-wrap gap-3 items-center">
        {filters.map((f) => renderControl(f, values[f.key] ?? '', onChange))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className={
              'text-xs text-earth-400 hover:text-earth-100 ' +
              'rounded-md px-2 py-1.5 ' +
              'focus:outline-none ' +
              'focus-visible:ring-2 focus-visible:ring-botanical-400/60 ' +
              'transition-colors'
            }
          >
            Clear
          </button>
        )}
      </div>
      {hasActiveFilters && chips.length > 0 && (
        <ul
          aria-label="Applied filters"
          className="flex flex-wrap gap-2 mt-3"
        >
          {chips.map((chip) => (
            <li
              key={chip.key}
              className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-[11px] bg-earth-900/60 border border-white/[0.08] text-earth-300"
            >
              <span>
                <span className="text-earth-500">{chip.filterLabel}: </span>
                <span className="text-earth-200">{chip.valueLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(chip.key, '')}
                aria-label={`Remove ${chip.filterLabel} filter`}
                className={
                  // 24x24 target meets WCAG 2.5.8 AA minimum; the inner
                  // glyph stays at 12px so the chip's visual weight does
                  // not change.
                  'inline-flex items-center justify-center w-6 h-6 rounded-full ' +
                  'text-earth-500 hover:text-earth-100 hover:bg-white/[0.08] ' +
                  'focus:outline-none ' +
                  'focus-visible:ring-2 focus-visible:ring-botanical-400/60 ' +
                  'transition-colors'
                }
              >
                <Icon.MultiplicationX size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
