import { screen, waitFor, within } from '@testing-library/react'
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
        <Route path="/wellness/:id" element={<div>Wellness goal detail</div>} />
      </Routes>
    </>,
    { initialEntries },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('WellnessNavigator — canonical catalog of wellness goals grouped by category', () => {
  it('renders an h1 title and a status region announcing the total on first paint', async () => {
    setup()
    expect(
      await screen.findByRole('heading', { level: 1, name: /wellness goals/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status').textContent).toMatch(/\d+ wellness goals/)
  })

  it('groups goals under category headings (h2) with category descriptions as subheadings', async () => {
    setup()
    // Wait for category headings to render.
    const headings = await screen.findAllByRole('heading', { level: 2 })
    expect(headings.length).toBeGreaterThan(0)

    // The first category in the seed is "Hair Growth & Scalp Health".
    const hairHeading = await screen.findByRole('heading', {
      level: 2,
      name: /hair growth & scalp health/i,
    })
    expect(hairHeading).toBeInTheDocument()

    // The category description should appear as prose siblings of the h2,
    // inside the same <section>.
    const section = hairHeading.closest('section')
    if (!section) throw new Error('expected the h2 to live inside a <section>')
    expect(
      within(section).getByText(/scalp circulation/i),
    ).toBeInTheDocument()
  })

  it('renders goal tiles with the goal name, plant count badge, and desired outcome', async () => {
    setup()
    // "Promote Hair Growth" is a real goal in the seed under Hair Growth & Scalp Health.
    const tile = await screen.findByRole('link', { name: /promote hair growth/i })
    expect(tile).toHaveAttribute('href', expect.stringMatching(/^\/wellness\/\d+/))
    expect(within(tile).getByText(/plants/i)).toBeInTheDocument()
    expect(
      within(tile).getByText(/thicker, fuller hair/i),
    ).toBeInTheDocument()
  })

  it('typing in the search syncs to the URL and narrows the visible tiles', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('heading', { level: 1, name: /wellness goals/i })

    await user.type(
      screen.getByRole('searchbox', { name: /search/i }),
      'sleep',
    )

    expect(probe()).toContain('q=sleep')
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(
        /\d+ of \d+ wellness goals match your filters/i,
      )
    })
  })

  it('hydrates the search value from an initial URL', async () => {
    setup(['/wellness?q=sleep'])
    expect(
      await screen.findByRole('searchbox', { name: /search/i }),
    ).toHaveValue('sleep')
  })

  it('shows the empty state when no goals match', async () => {
    setup(['/wellness?q=zzznotathing'])
    expect(
      await screen.findByText(/no wellness goals match your filters\./i),
    ).toBeInTheDocument()
  })

  it('preserves the filter URL when navigating into a wellness goal detail', async () => {
    const user = userEvent.setup()
    setup(['/wellness?q=sleep'])
    await screen.findByRole('searchbox', { name: /search/i })

    await waitFor(() => {
      const tiles = screen
        .getAllByRole('link')
        .filter((l) => /^\/wellness\/\d/.test(l.getAttribute('href') ?? ''))
      expect(tiles.length).toBeGreaterThan(0)
    })

    const firstTile = screen
      .getAllByRole('link')
      .find((l) => /^\/wellness\/\d/.test(l.getAttribute('href') ?? ''))
    if (!firstTile) throw new Error('expected a wellness goal tile')
    await user.click(firstTile)

    await waitFor(() => {
      expect(probe()).toMatch(/^\/wellness\/\d+/)
      expect(probe()).toContain('q=sleep')
    })
  })
})
