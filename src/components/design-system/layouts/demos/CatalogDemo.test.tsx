// @vitest-environment jsdom
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import CatalogDemo, { CATALOG_DEMO_ITEMS } from './CatalogDemo'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function setup(initialEntries: string[] = ['/design-system/layouts/catalog']) {
  return renderWithRouter(
    <Routes>
      <Route
        path="/design-system/layouts/catalog"
        element={
          <>
            <LocationProbe />
            <CatalogDemo />
          </>
        }
      />
    </Routes>,
    { initialEntries },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('CatalogDemo — composes the canonical Catalog layout with FilterBar', () => {
  it('renders every demo item on first paint', () => {
    setup()
    for (const item of CATALOG_DEMO_ITEMS) {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    }
  })

  it('typing in the search input narrows the visible grid', async () => {
    const user = userEvent.setup()
    setup()

    const input = screen.getByRole('searchbox', { name: /search/i })
    await user.type(input, 'rose')

    // "Rosemary" matches; "Tulsi" does not.
    expect(screen.getByText('Rosemary')).toBeInTheDocument()
    expect(screen.queryByText('Tulsi')).toBeNull()
  })

  it('search keystrokes synchronize into the URL', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByRole('searchbox', { name: /search/i }), 'mug')

    expect(probe()).toContain('q=mug')
  })

  it('selecting a category filters and updates the URL', async () => {
    const user = userEvent.setup()
    setup()

    await user.selectOptions(
      screen.getByRole('combobox', { name: /category/i }),
      'entheogenic',
    )

    expect(probe()).toContain('category=entheogenic')
    // Datura is entheogenic, Lavender is not.
    expect(screen.getByText('Datura')).toBeInTheDocument()
    expect(screen.queryByText('Lavender')).toBeNull()
  })

  it('an initial URL with filter params hydrates the controls', () => {
    setup(['/design-system/layouts/catalog?q=cacao&category=both'])

    expect(screen.getByRole('searchbox', { name: /search/i })).toHaveValue('cacao')
    expect(screen.getByRole('combobox', { name: /category/i })).toHaveValue('both')
    // Only Cacao matches.
    expect(screen.getByText('Cacao')).toBeInTheDocument()
    expect(screen.queryByText('Rosemary')).toBeNull()
  })

  it('renders applied-filter chips when filters are active', () => {
    setup(['/design-system/layouts/catalog?category=conventional'])

    const chips = screen.getByRole('list', { name: /applied filters/i })
    const [chip] = within(chips).getAllByRole('listitem')
    expect(chip).toHaveTextContent(/Category:\s*Conventional/i)
  })

  it('dismissing a chip removes that single filter from the URL', async () => {
    const user = userEvent.setup()
    setup(['/design-system/layouts/catalog?q=rose&category=conventional'])

    await user.click(
      screen.getByRole('button', { name: /remove category filter/i }),
    )

    expect(probe()).toContain('q=rose')
    expect(probe()).not.toContain('category=')
  })

  it('the Clear action resets every filter and clears the URL params', async () => {
    const user = userEvent.setup()
    setup(['/design-system/layouts/catalog?q=rose&category=conventional'])

    await user.click(screen.getByRole('button', { name: /clear all filters/i }))

    expect(probe()).not.toContain('q=')
    expect(probe()).not.toContain('category=')
    // Full grid is back.
    expect(screen.getByText('Rosemary')).toBeInTheDocument()
    expect(screen.getByText('Datura')).toBeInTheDocument()
  })

  it('shows the empty state when no items match', async () => {
    setup(['/design-system/layouts/catalog?q=zzznotathing'])

    // The visible <p> ends in a period; the role=status copy does not.
    // The period disambiguates from the live-region announcement.
    expect(
      await screen.findByText(/no items match your filters\./i),
    ).toBeInTheDocument()
  })

  it('exposes the result count to assistive tech via role="status" (WCAG 4.1.3)', async () => {
    const user = userEvent.setup()
    setup()

    expect(screen.getByRole('status')).toHaveTextContent('12 items')

    await user.selectOptions(
      screen.getByRole('combobox', { name: /category/i }),
      'entheogenic',
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      /2 of 12 items match your filters/i,
    )
  })

  it('announces the empty state in the status region', () => {
    setup(['/design-system/layouts/catalog?q=zzznotathing'])
    expect(screen.getByRole('status')).toHaveTextContent(
      /no items match your filters/i,
    )
  })

  it('the empty state offers a way back to results', async () => {
    const user = userEvent.setup()
    setup(['/design-system/layouts/catalog?q=zzznotathing'])

    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    expect(screen.getByText('Rosemary')).toBeInTheDocument()
    expect(probe()).not.toContain('q=')
  })
})
