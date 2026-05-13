import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import AilmentNavigator from './AilmentNavigator'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function setup(initialEntries: string[] = ['/ailments']) {
  return renderWithRouter(
    <Routes>
      <Route
        path="/ailments"
        element={
          <>
            <LocationProbe />
            <AilmentNavigator />
          </>
        }
      />
      <Route path="/ailments/:id" element={<div>Ailment detail</div>} />
    </Routes>,
    { initialEntries },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('AilmentNavigator — canonical catalog of ailments grouped by body system', () => {
  it('renders an h1 title and a status region announcing the total on first paint', async () => {
    setup()
    expect(await screen.findByRole('heading', { level: 1, name: /ailments/i })).toBeInTheDocument()
    // We don't assert the exact count here — it comes from the real seed data
    // and would couple this test to the data file. We only check the shape.
    expect(screen.getByRole('status').textContent).toMatch(/\d+ ailments/)
  })

  it('groups ailments under body-system headings (h2)', async () => {
    setup()
    // Wait for data to load by waiting for any h2 to appear.
    const headings = await screen.findAllByRole('heading', { level: 2 })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('selecting a category narrows results and syncs to URL', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByRole('heading', { level: 1, name: /ailments/i })

    await user.selectOptions(
      screen.getByRole('combobox', { name: /category/i }),
      'emotional',
    )

    expect(probe()).toContain('category=emotional')
    expect(screen.getByRole('status').textContent).toMatch(
      /\d+ of \d+ ailments match your filters/,
    )
  })

  it('hydrates filter values from an initial URL', async () => {
    setup(['/ailments?category=emotional'])
    expect(
      await screen.findByRole('combobox', { name: /category/i }),
    ).toHaveValue('emotional')
  })

  it('shows the empty state when no ailments match', async () => {
    setup(['/ailments?q=zzznotathing'])
    expect(
      await screen.findByText(/no ailments match your filters\./i),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      /no ailments match your filters/i,
    )
  })

  it('Clear from the empty state restores the full catalog', async () => {
    const user = userEvent.setup()
    setup(['/ailments?q=zzznotathing'])
    await screen.findByText(/no ailments match your filters\./i)

    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    expect(probe()).not.toContain('q=')
    // Status reverts to a plain count.
    expect(screen.getByRole('status').textContent).toMatch(/^\d+ ailments$/)
  })
})
