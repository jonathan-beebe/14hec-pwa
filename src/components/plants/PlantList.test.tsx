// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import PlantList from './PlantList'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function setup(initialEntries: string[] = ['/plants']) {
  return renderWithRouter(
    <>
      <LocationProbe />
      <Routes>
        <Route path="/plants" element={<PlantList />} />
        <Route path="/plants/:id" element={<div>Plant detail</div>} />
      </Routes>
    </>,
    { initialEntries },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('PlantList — canonical catalog of 207 plants', () => {
  it('renders the page title and announces the total count on first paint', async () => {
    setup()
    expect(
      await screen.findByRole('heading', { level: 1, name: /plants/i }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(/^\d+ plants$/)
    })
  })

  it('typing in the search input narrows results and syncs the URL', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('heading', { level: 1, name: /plants/i })

    await user.type(
      screen.getByRole('searchbox', { name: /search/i }),
      'rose',
    )

    await waitFor(() => {
      expect(probe()).toContain('q=rose')
    })
  })

  it('selecting a category filter syncs to URL and updates the status', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('heading', { level: 1, name: /plants/i })

    await user.selectOptions(
      screen.getByRole('combobox', { name: /category/i }),
      'entheogenic',
    )

    expect(probe()).toContain('category=entheogenic')
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(
        /\d+ of \d+ plants match your filters/,
      )
    })
  })

  it('hydrates filter controls from URL params', async () => {
    setup(['/plants?category=entheogenic'])
    expect(
      await screen.findByRole('combobox', { name: /category/i }),
    ).toHaveValue('entheogenic')
  })

  it('shows the empty state when no plants match', async () => {
    setup(['/plants?q=zzznotathing'])
    expect(
      await screen.findByText(/no plants match your filters\./i),
    ).toBeInTheDocument()
  })

  it('preserves the filter URL when navigating to a plant detail', async () => {
    const user = userEvent.setup()
    setup(['/plants?category=entheogenic'])
    await screen.findByRole('heading', { level: 1, name: /plants/i })

    // Wait for at least one filtered plant tile to appear.
    await waitFor(() => {
      const tiles = screen
        .getAllByRole('link')
        .filter((l) => /^\/plants\//.test(l.getAttribute('href') ?? ''))
      expect(tiles.length).toBeGreaterThan(0)
    })

    const firstTile = screen
      .getAllByRole('link')
      .find((l) => /^\/plants\//.test(l.getAttribute('href') ?? ''))
    if (!firstTile) throw new Error('expected a plant tile')
    await user.click(firstTile)

    await waitFor(() => {
      expect(probe()).toMatch(/^\/plants\/\d+/)
      expect(probe()).toContain('category=entheogenic')
    })
  })
})
