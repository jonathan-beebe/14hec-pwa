import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import CatalogGroupedDemo from './CatalogGroupedDemo'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function setup(
  initialEntries: string[] = ['/design-system/layouts/catalog-grouped'],
) {
  return renderWithRouter(
    <Routes>
      <Route
        path="/design-system/layouts/catalog-grouped"
        element={
          <>
            <LocationProbe />
            <CatalogGroupedDemo />
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

describe('CatalogGroupedDemo — grouped-results variant of the canonical catalog', () => {
  it('renders one heading per non-empty group on first paint', () => {
    setup()
    expect(
      screen.getByRole('heading', { level: 2, name: /conventional/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /entheogenic/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /both/i })).toBeInTheDocument()
  })

  it('typing in the search narrows results and hides empty groups', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(
      screen.getByRole('searchbox', { name: /search/i }),
      'datura',
    )

    expect(probe()).toContain('q=datura')
    // Only the entheogenic group should remain.
    expect(
      screen.getByRole('heading', { level: 2, name: /entheogenic/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 2, name: /^conventional/i }),
    ).toBeNull()
  })

  it('announces a count-of-total when filters narrow the results', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByRole('searchbox', { name: /search/i }), 'datura')

    expect(screen.getByRole('status')).toHaveTextContent(
      /1 of 12 items match your filters/i,
    )
  })

  it('shows the empty state when nothing matches', () => {
    setup(['/design-system/layouts/catalog-grouped?q=zzznotathing'])
    expect(
      screen.getByText(/no items match your filters\./i),
    ).toBeInTheDocument()
  })
})
