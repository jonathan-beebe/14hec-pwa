import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import PreparationList from './PreparationList'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location-probe">{location.pathname}</div>
}

function setup() {
  return renderWithRouter(
    <Routes>
      <Route
        path="/preparations"
        element={
          <>
            <LocationProbe />
            <PreparationList />
          </>
        }
      />
      <Route path="/preparations/:id" element={<LocationProbe />} />
    </Routes>,
    { initialEntries: ['/preparations'] },
  )
}

describe('PreparationList — comparison table of preparation methods', () => {
  it('renders the page title', async () => {
    setup()
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /preparation methods/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders one column per attribute on the desktop table', async () => {
    setup()
    await screen.findByRole('heading', { level: 1, name: /preparation methods/i })
    const table = await screen.findByRole('table')
    const headers = within(table).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'Method',
      'Solvent',
      'Best parts',
      'Absorption',
      'Concentration',
      'Shelf life',
    ])
  })

  it('renders one navigable row per preparation', async () => {
    setup()
    const table = await screen.findByRole('table')
    await waitFor(() => {
      const rows = within(table).getAllByRole('row')
      expect(rows.length).toBeGreaterThan(1)
    })
  })

  it('clicking a row navigates to the preparation detail', async () => {
    const user = userEvent.setup()
    setup()
    const table = await screen.findByRole('table')
    await waitFor(() => {
      expect(within(table).getAllByRole('row').length).toBeGreaterThan(1)
    })
    const firstRowLink = within(table)
      .getAllByRole('link')
      .find((l) => /view preparation details/i.test(l.getAttribute('aria-label') ?? ''))
    if (!firstRowLink) throw new Error('expected a row link on the table')

    await user.click(firstRowLink)

    await waitFor(() => {
      expect(screen.getByTestId('location-probe').textContent).toMatch(
        /^\/preparations\/\d+$/,
      )
    })
  })
})
