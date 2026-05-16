// @vitest-environment jsdom
import { screen, within } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import TableDemo from './TableDemo'
import { CATALOG_DEMO_ITEMS } from './CatalogDemo'

function setup() {
  return renderWithRouter(
    <Routes>
      <Route path="/design-system/layouts/table" element={<TableDemo />} />
    </Routes>,
    { initialEntries: ['/design-system/layouts/table'] },
  )
}

describe('TableDemo — composes TableLayout + RecordTable', () => {
  it('renders the page title and a row per demo item on the desktop table', () => {
    setup()
    expect(
      screen.getByRole('heading', { level: 1, name: /botanicals \(table\)/i }),
    ).toBeInTheDocument()

    const table = screen.getByRole('table')
    // 1 header row + N data rows.
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(CATALOG_DEMO_ITEMS.length + 1)
  })

  it('every row links to its own design-system table detail route', () => {
    setup()
    for (const item of CATALOG_DEMO_ITEMS) {
      const links = screen.getAllByRole('link', {
        name: new RegExp(`${item.name}, view details`, 'i'),
      })
      expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        expect(link).toHaveAttribute(
          'href',
          `/design-system/layouts/table/${item.id}`,
        )
      }
    }
  })
})
