// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import BodySystemsList from './BodySystemsList'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function setup(initialEntries: string[] = ['/body-systems']) {
  return renderWithRouter(
    <>
      <LocationProbe />
      <Routes>
        <Route path="/body-systems" element={<BodySystemsList />} />
        <Route path="/body-systems/:id" element={<div>Detail</div>} />
      </Routes>
    </>,
    { initialEntries },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('BodySystemsList — canonical catalog of body systems', () => {
  it('renders an h1 title and a status announcement on first paint', async () => {
    setup()
    expect(
      await screen.findByRole('heading', { level: 1, name: /body systems/i }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(
        /^\d+ body systems$/,
      )
    })
  })

  it('groups systems by category under h2 headings', async () => {
    setup()
    await screen.findByRole('heading', { level: 1, name: /body systems/i })

    const headings = await screen.findAllByRole('heading', { level: 2 })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('filters by category and syncs to URL', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('heading', { level: 1, name: /body systems/i })

    await user.selectOptions(
      screen.getByRole('combobox', { name: /category/i }),
      'organ',
    )

    expect(probe()).toContain('category=organ')
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(
        /\d+ of \d+ body systems match your filters/,
      )
    })
  })

  it('shows the empty state when no systems match', async () => {
    setup(['/body-systems?q=zzznotathing'])
    expect(
      await screen.findByText(/no body systems match your filters\./i),
    ).toBeInTheDocument()
  })

  it('preserves the filter URL when navigating to a body system detail', async () => {
    const user = userEvent.setup()
    setup(['/body-systems?category=organ'])
    await screen.findByRole('heading', { level: 1, name: /body systems/i })

    await waitFor(() => {
      const tiles = screen
        .getAllByRole('link')
        .filter((l) => /^\/body-systems\//.test(l.getAttribute('href') ?? ''))
      expect(tiles.length).toBeGreaterThan(0)
    })

    const firstTile = screen
      .getAllByRole('link')
      .find((l) => /^\/body-systems\//.test(l.getAttribute('href') ?? ''))
    if (!firstTile) throw new Error('expected a body-system tile')
    await user.click(firstTile)

    await waitFor(() => {
      expect(probe()).toMatch(/^\/body-systems\/\d+/)
      expect(probe()).toContain('category=organ')
    })
  })
})
