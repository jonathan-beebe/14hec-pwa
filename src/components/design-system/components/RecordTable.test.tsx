import { screen, within } from '@testing-library/react'
import { renderWithRouter } from '@/test/render'
import { Route, Routes } from 'react-router-dom'
import RecordTable, { type TableColumn } from './RecordTable'

interface Row {
  id: number
  name: string
  solvent: string
  speed: string
}

const ROWS: Row[] = [
  { id: 1, name: 'Tincture', solvent: 'Alcohol', speed: 'Fast' },
  { id: 2, name: 'Decoction', solvent: 'Water', speed: 'Moderate' },
]

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', header: 'Method', primary: true, render: (r) => r.name },
  { key: 'solvent', header: 'Solvent', render: (r) => r.solvent },
  {
    key: 'speed',
    header: 'Absorption',
    badge: true,
    render: (r) => <span data-testid={`speed-${r.id}`}>{r.speed}</span>,
  },
]

function setup() {
  return renderWithRouter(
    <Routes>
      <Route
        path="/"
        element={
          <RecordTable
            rows={ROWS}
            columns={COLUMNS}
            rowKey={(r) => r.id}
            rowHref={(r) => `/preparations/${r.id}`}
            rowLabel={(r) => `${r.name}, view details`}
          />
        }
      />
    </Routes>,
  )
}

describe('RecordTable — desktop semantics', () => {
  it('renders a real <table> with one <th scope="col"> per column', () => {
    setup()
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    const headers = within(table).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'Method',
      'Solvent',
      'Absorption',
    ])
    for (const h of headers) {
      expect(h).toHaveAttribute('scope', 'col')
    }
  })

  it('renders one row per record with cells in column order', () => {
    setup()
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')
    // 1 header row + 2 data rows.
    expect(rows).toHaveLength(3)
    const firstDataRow = rows[1]
    if (!firstDataRow) throw new Error('expected a data row')
    const cells = within(firstDataRow).getAllByRole('cell')
    expect(cells[0]).toHaveTextContent('Tincture')
    expect(cells[1]).toHaveTextContent('Alcohol')
    expect(cells[2]).toHaveTextContent('Fast')
  })

  it('renders each desktop row as a NavLink whose accessible name comes from rowLabel', () => {
    setup()
    // Both desktop and mobile renderings exist in jsdom; expect two links per row.
    const linkToTincture = screen.getAllByRole('link', {
      name: /tincture, view details/i,
    })
    expect(linkToTincture.length).toBeGreaterThanOrEqual(1)
    for (const link of linkToTincture) {
      expect(link).toHaveAttribute('href', '/preparations/1')
    }
  })

  it('exposes the optional caption to assistive tech', () => {
    renderWithRouter(
      <Routes>
        <Route
          path="/"
          element={
            <RecordTable
              rows={ROWS}
              columns={COLUMNS}
              rowKey={(r) => r.id}
              rowHref={(r) => `/preparations/${r.id}`}
              rowLabel={(r) => r.name}
              caption="Preparation methods, comparison table"
            />
          }
        />
      </Routes>,
    )
    expect(
      screen.getByRole('table', { name: /preparation methods, comparison table/i }),
    ).toBeInTheDocument()
  })
})

describe('RecordTable — mobile fallback', () => {
  it('renders a <ul> of cards with the primary column as the headline', () => {
    setup()
    // The mobile rendering uses a list; pick the list whose accessible role is list
    // and assert one item per row.
    const lists = screen.getAllByRole('list')
    // Only the mobile cards container is a list (the dl uses term/definition roles).
    const cardsList = lists.find((l) => l.tagName === 'UL')
    if (!cardsList) throw new Error('expected the mobile cards <ul>')
    const items = within(cardsList).getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('renders the non-primary, non-badge columns as <dt>/<dd> pairs per card', () => {
    setup()
    // dt elements expose role="term"; dd exposes role="definition".
    const terms = screen.getAllByRole('term')
    // One "Solvent" term per row, so 2 total.
    expect(terms.filter((t) => t.textContent === 'Solvent')).toHaveLength(2)
    const definitions = screen.getAllByRole('definition')
    expect(definitions.some((d) => d.textContent === 'Alcohol')).toBe(true)
    expect(definitions.some((d) => d.textContent === 'Water')).toBe(true)
  })
})
