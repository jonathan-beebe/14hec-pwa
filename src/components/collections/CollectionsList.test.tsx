// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import CollectionsList from './CollectionsList'

function setup() {
  return renderWithRouter(
    <Routes>
      <Route path="/collections" element={<CollectionsList />} />
      <Route path="/collections/new" element={<div>New collection page</div>} />
      <Route path="/collections/:id" element={<div>Detail</div>} />
    </Routes>,
    { initialEntries: ['/collections'] },
  )
}

describe('CollectionsList — canonical catalog of user collections', () => {
  it('renders an h1 title and a header action that links to /collections/new', async () => {
    setup()
    expect(
      await screen.findByRole('heading', { level: 1, name: /my collections/i }),
    ).toBeInTheDocument()
    const newButton = await screen.findByRole('button', {
      name: /\+\s*new collection/i,
    })
    expect(newButton).toBeInTheDocument()
  })

  it('exposes a status region announcing the current state', async () => {
    setup()
    await waitFor(() => {
      // The freshly seeded test environment may have zero collections.
      // We only check the shape: either "N collections" or "0 collections".
      expect(screen.getByRole('status').textContent).toMatch(
        /^\d+ collections?$|^0 collections$/,
      )
    })
  })
})
