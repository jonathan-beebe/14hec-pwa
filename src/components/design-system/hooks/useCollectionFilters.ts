import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SelectOption } from '../atoms/Select'

/**
 * A `search` filter renders as a `<SearchInput>` and is bound to a URL
 * param of the given `key` (typically `q`).
 */
export interface SearchFilter {
  kind: 'search'
  key: string
  placeholder?: string
  /** Accessible name for the input. Defaults to `placeholder` or 'Search'. */
  label?: string
}

/**
 * A `select` filter renders as a `<Select>` and is bound to a URL param of
 * the given `key`. The empty-string option (`value: ''`) is the inactive
 * state — when selected, the key is removed from the URL.
 */
export interface SelectFilter {
  kind: 'select'
  key: string
  label: string
  options: SelectOption[]
}

export type CatalogFilter = SearchFilter | SelectFilter

export interface UseCollectionFiltersReturn {
  /** Current filter values, keyed by filter `key`. Missing params are ''. */
  values: Record<string, string>
  /** Update one filter. Setting to '' removes the param from the URL. */
  setValue: (key: string, value: string) => void
  /** Reset every configured filter. Unrelated URL params are preserved. */
  clear: () => void
  /** True when any configured filter has a non-empty value. */
  hasActiveFilters: boolean
  /**
   * Build a child-route href that carries the current filter values
   * forward as a query string. Use for list-row links so the filtered
   * context survives navigation into detail pages — and so browser back
   * returns the user to the filtered list, not the bare index.
   *
   * Only the keys configured in this hook's `filters` are preserved;
   * unrelated search params on the current URL (e.g. a sibling demo's
   * scoped state, analytics keys) are intentionally left behind so they
   * don't leak between routes.
   */
  linkToChild: (pathname: string) => string
}

/**
 * Owns filter state for a Catalog view. The URL is the source of truth:
 * every filter is bound to a query param of its `key`. Writes use
 * `replace: true` so individual keystrokes do not bloat browser history —
 * the filtered URL is shareable, but back-button still returns the user
 * to the previous page rather than to a prior filter state.
 *
 * Unrelated query params on the same URL (e.g. a `demoCatalog=42` selector
 * used by the layouts catalog) are preserved across every operation.
 */
export function useCollectionFilters(
  filters: CatalogFilter[],
): UseCollectionFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams()

  const values = useMemo(() => {
    const result: Record<string, string> = {}
    for (const f of filters) {
      result[f.key] = searchParams.get(f.key) ?? ''
    }
    return result
  }, [filters, searchParams])

  const hasActiveFilters = useMemo(
    () => Object.values(values).some((v) => v !== ''),
    [values],
  )

  const setValue = useCallback(
    (key: string, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === '') next.delete(key)
          else next.set(key, value)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const clear = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const f of filters) next.delete(f.key)
        return next
      },
      { replace: true },
    )
  }, [filters, setSearchParams])

  const linkToChild = useCallback(
    (pathname: string): string => {
      const params = new URLSearchParams()
      for (const f of filters) {
        const v = values[f.key]
        if (v) params.set(f.key, v)
      }
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    },
    [filters, values],
  )

  return { values, setValue, clear, hasActiveFilters, linkToChild }
}
