// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FilterBar from './FilterBar'
import type { CatalogFilter } from '../hooks/useCollectionFilters'

const filters: CatalogFilter[] = [
  { kind: 'search', key: 'q', placeholder: 'Search by name…', label: 'Search' },
  {
    kind: 'select',
    key: 'category',
    label: 'Category',
    options: [
      { value: '', label: 'All Categories' },
      { value: 'conventional', label: 'Conventional' },
      { value: 'entheogenic', label: 'Entheogenic' },
    ],
  },
]

function setup(props: Partial<React.ComponentProps<typeof FilterBar>> = {}) {
  const onChange = vi.fn()
  const onClear = vi.fn()
  const defaults: React.ComponentProps<typeof FilterBar> = {
    filters,
    values: { q: '', category: '' },
    onChange,
    onClear,
    hasActiveFilters: false,
  }
  const renderResult = render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <FilterBar {...defaults} {...props} />
    </MemoryRouter>,
  )
  return { onChange, onClear, ...renderResult }
}

describe('FilterBar — config-driven rendering', () => {
  it('is exposed as a "search" landmark to assistive tech', () => {
    setup()
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('renders one control per filter from the config', () => {
    setup()
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
  })

  it('binds each control to its value in `values`', () => {
    setup({ values: { q: 'yarrow', category: 'conventional' } })
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('yarrow')
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue(
      'conventional',
    )
  })
})

describe('FilterBar — change events', () => {
  it('calls onChange(key, value) when the user types in a search input', async () => {
    const user = userEvent.setup()
    const { onChange } = setup()
    const input = screen.getByRole('searchbox', { name: 'Search' })

    await user.type(input, 'r')

    expect(onChange).toHaveBeenCalledWith('q', 'r')
  })

  it('calls onChange(key, value) when the user picks a select option', async () => {
    const user = userEvent.setup()
    const { onChange } = setup()
    const select = screen.getByRole('combobox', { name: 'Category' })

    await user.selectOptions(select, 'entheogenic')

    expect(onChange).toHaveBeenCalledWith('category', 'entheogenic')
  })
})

describe('FilterBar — clear action', () => {
  it('does not render the Clear button when there are no active filters', () => {
    setup({ hasActiveFilters: false })
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull()
  })

  it('renders the Clear button when there are active filters', () => {
    setup({ hasActiveFilters: true, values: { q: 'rose', category: '' } })
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument()
  })

  it('calls onClear when the Clear button is clicked', async () => {
    const user = userEvent.setup()
    const { onClear } = setup({
      hasActiveFilters: true,
      values: { q: 'rose', category: '' },
    })

    await user.click(screen.getByRole('button', { name: /clear all filters/i }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

describe('FilterBar — applied filter chips', () => {
  it('does not render the chips region when no filters are active', () => {
    setup({ hasActiveFilters: false })
    expect(screen.queryByRole('list', { name: /applied filters/i })).toBeNull()
  })

  it('renders one chip per non-empty filter value', () => {
    setup({
      hasActiveFilters: true,
      values: { q: 'rose', category: 'conventional' },
    })
    const chipList = screen.getByRole('list', { name: /applied filters/i })
    const chips = within(chipList).getAllByRole('listitem')
    expect(chips).toHaveLength(2)
  })

  it('labels select chips with "Label: OptionLabel"', () => {
    setup({
      hasActiveFilters: true,
      values: { q: '', category: 'conventional' },
    })
    const chipList = screen.getByRole('list', { name: /applied filters/i })
    const [chip] = within(chipList).getAllByRole('listitem')
    expect(chip).toHaveTextContent(/Category:\s*Conventional/i)
  })

  it('labels search chips with "Label: value"', () => {
    setup({
      hasActiveFilters: true,
      values: { q: 'rose', category: '' },
    })
    const chipList = screen.getByRole('list', { name: /applied filters/i })
    const [chip] = within(chipList).getAllByRole('listitem')
    expect(chip).toHaveTextContent(/Search:\s*rose/i)
  })

  it('dismissing a chip calls onChange(key, "") for that filter', async () => {
    const user = userEvent.setup()
    const { onChange } = setup({
      hasActiveFilters: true,
      values: { q: 'rose', category: 'conventional' },
    })

    await user.click(
      screen.getByRole('button', { name: /remove category filter/i }),
    )

    expect(onChange).toHaveBeenCalledWith('category', '')
  })
})
