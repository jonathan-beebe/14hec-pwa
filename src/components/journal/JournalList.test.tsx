import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import JournalList from './JournalList'

function setup() {
  return renderWithRouter(
    <Routes>
      <Route path="/journal" element={<JournalList />} />
      <Route path="/journal/new" element={<div>New entry</div>} />
      <Route path="/journal/:id" element={<div>Entry detail</div>} />
    </Routes>,
    { initialEntries: ['/journal'] },
  )
}

describe('JournalList — canonical catalog of journal entries', () => {
  it('renders an h1 title and a "+ New entry" header action', async () => {
    setup()
    expect(
      await screen.findByRole('heading', { level: 1, name: /journal/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /\+\s*new entry/i }),
    ).toBeInTheDocument()
  })

  it('exposes a status region announcing the count', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(
        /journal entries?$|journal entry$/,
      )
    })
  })

  it('shows the empty CTA when no entries exist and no filters are active', async () => {
    setup()
    // jsdom localStorage-backed journal starts empty.
    expect(
      await screen.findByText(/your journal awaits its first entry/i),
    ).toBeInTheDocument()
  })
})
