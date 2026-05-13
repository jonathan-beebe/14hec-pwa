import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import WellnessNavigator from './WellnessNavigator'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function setup(initialEntries: string[] = ['/wellness']) {
  return renderWithRouter(
    <>
      <LocationProbe />
      <Routes>
        <Route path="/wellness" element={<WellnessNavigator />} />
        <Route path="/wellness/:id" element={<div>Detail</div>} />
      </Routes>
    </>,
    { initialEntries },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('WellnessNavigator — hybrid tree-and-search catalog of wellness goals', () => {
  it('renders the tree by default with no active search', async () => {
    setup()
    expect(
      await screen.findByRole('heading', { level: 1, name: /wellness goals/i }),
    ).toBeInTheDocument()
    // At least one category button with aria-expanded should appear.
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { expanded: false }).length,
      ).toBeGreaterThan(0)
    })
  })

  it('typing in the search syncs to the URL and switches to search mode', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('heading', { level: 1, name: /wellness goals/i })

    await user.type(
      screen.getByRole('searchbox', { name: /search/i }),
      'sleep',
    )

    expect(probe()).toContain('q=sleep')
    // Tree mode shows aria-expanded buttons; search mode hides them.
    await waitFor(() => {
      expect(
        screen.queryAllByRole('button', { expanded: false }).length,
      ).toBe(0)
    })
  })

  it('hydrates search mode from an initial URL', async () => {
    setup(['/wellness?q=sleep'])
    expect(
      await screen.findByRole('searchbox', { name: /search/i }),
    ).toHaveValue('sleep')
  })

  it('preserves the filter URL when navigating into a wellness goal detail', async () => {
    const user = userEvent.setup()
    setup(['/wellness?q=sleep'])
    await screen.findByRole('searchbox', { name: /search/i })

    await waitFor(() => {
      const tiles = screen
        .getAllByRole('link')
        .filter((l) => /^\/wellness\//.test(l.getAttribute('href') ?? ''))
      expect(tiles.length).toBeGreaterThan(0)
    })

    const firstTile = screen
      .getAllByRole('link')
      .find((l) => /^\/wellness\//.test(l.getAttribute('href') ?? ''))
    if (!firstTile) throw new Error('expected a wellness goal tile')
    await user.click(firstTile)

    await waitFor(() => {
      expect(probe()).toMatch(/^\/wellness\/\d+/)
      expect(probe()).toContain('q=sleep')
    })
  })
})
