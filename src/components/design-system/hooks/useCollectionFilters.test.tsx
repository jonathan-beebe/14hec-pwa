import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import {
  useCollectionFilters,
  type CatalogFilter,
} from './useCollectionFilters'

const filters: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search…' },
  {
    kind: 'select',
    key: 'category',
    label: 'Category',
    options: [
      { value: '', label: 'All' },
      { value: 'conventional', label: 'Conventional' },
      { value: 'entheogenic', label: 'Entheogenic' },
    ],
  },
]

function wrapperFor(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="*" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    )
  }
}

/** Helper hook: renders the URL search string alongside the filter state
 * so tests can assert on the URL as the source of truth. */
function useFiltersAndUrl(config: CatalogFilter[]) {
  const filters = useCollectionFilters(config)
  const location = useLocation()
  return { ...filters, search: location.search }
}

describe('useCollectionFilters', () => {
  it('reads initial values from the URL search params', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=yarrow&category=conventional'),
    })

    expect(result.current.values).toEqual({
      q: 'yarrow',
      category: 'conventional',
    })
  })

  it('defaults missing params to empty string', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants'),
    })

    expect(result.current.values).toEqual({ q: '', category: '' })
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('hasActiveFilters is true when any value is non-empty', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=rose'),
    })

    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('setValue writes the new value to the URL', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants'),
    })

    act(() => {
      result.current.setValue('q', 'lavender')
    })

    expect(result.current.values.q).toBe('lavender')
    expect(result.current.search).toContain('q=lavender')
  })

  it('setValue with empty string removes the key from the URL', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=rose&category=conventional'),
    })

    act(() => {
      result.current.setValue('q', '')
    })

    expect(result.current.values.q).toBe('')
    expect(result.current.search).not.toContain('q=')
    expect(result.current.search).toContain('category=conventional')
  })

  it('clear removes every configured filter key but preserves others', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor(
        '/plants?q=rose&category=conventional&unrelated=keep-me',
      ),
    })

    expect(result.current.hasActiveFilters).toBe(true)

    act(() => {
      result.current.clear()
    })

    expect(result.current.values).toEqual({ q: '', category: '' })
    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.search).not.toContain('q=')
    expect(result.current.search).not.toContain('category=')
    expect(result.current.search).toContain('unrelated=keep-me')
  })

  it('setValue preserves unrelated search params', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?demoCatalog=42'),
    })

    act(() => {
      result.current.setValue('q', 'tulsi')
    })

    expect(result.current.search).toContain('demoCatalog=42')
    expect(result.current.search).toContain('q=tulsi')
  })
})

describe('useCollectionFilters — linkToChild preserves filter state', () => {
  it('linkToChild returns the bare path when no filters are active', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants'),
    })

    expect(result.current.linkToChild('/plants/123')).toBe('/plants/123')
  })

  it('linkToChild appends a query string carrying the active filter values', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=yarrow'),
    })

    expect(result.current.linkToChild('/plants/123')).toBe(
      '/plants/123?q=yarrow',
    )
  })

  it('linkToChild includes every configured filter that has a non-empty value', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=yarrow&category=conventional'),
    })

    const href = result.current.linkToChild('/plants/123')
    expect(href.startsWith('/plants/123?')).toBe(true)
    expect(href).toContain('q=yarrow')
    expect(href).toContain('category=conventional')
  })

  it('linkToChild does not leak search params outside the configured filter keys', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=yarrow&unrelated=keep-me'),
    })

    const href = result.current.linkToChild('/plants/123')
    expect(href).toContain('q=yarrow')
    expect(href).not.toContain('unrelated')
  })

  it('linkToChild omits filter keys that hold empty strings', () => {
    const { result } = renderHook(() => useFiltersAndUrl(filters), {
      wrapper: wrapperFor('/plants?q=yarrow&category='),
    })

    const href = result.current.linkToChild('/plants/123')
    expect(href).toContain('q=yarrow')
    expect(href).not.toContain('category=')
  })
})
