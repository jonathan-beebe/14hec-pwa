// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import TableLayout from './TableLayout'

describe('TableLayout — slots', () => {
  it('renders header and children when itemCount > 0', () => {
    render(
      <TableLayout header={<div>HEADER</div>} itemCount={3}>
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.getByText('HEADER')).toBeInTheDocument()
    expect(screen.getByText('TABLE')).toBeInTheDocument()
  })

  it('renders the optional filters region when provided', () => {
    render(
      <TableLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        itemCount={3}
      >
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.getByText('FILTERS')).toBeInTheDocument()
  })

  it('omits the sticky filter region entirely when filters is absent', () => {
    render(
      <TableLayout header={<div>HEADER</div>} itemCount={3}>
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.queryByText('FILTERS')).toBeNull()
  })

  it('swaps to the empty slot when itemCount is 0 and empty is provided', () => {
    render(
      <TableLayout
        header={<div>HEADER</div>}
        empty={<div>EMPTY</div>}
        itemCount={0}
      >
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.queryByText('TABLE')).toBeNull()
    expect(screen.getByText('EMPTY')).toBeInTheDocument()
  })

  it('keeps showing children when itemCount is 0 but no empty slot is provided', () => {
    render(
      <TableLayout header={<div>HEADER</div>} itemCount={0}>
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.getByText('TABLE')).toBeInTheDocument()
  })
})

describe('TableLayout — status message (WCAG 4.1.3)', () => {
  it('does not render a status region when statusMessage is omitted', () => {
    render(
      <TableLayout header={<div>HEADER</div>} itemCount={3}>
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders statusMessage inside a role="status" region for assistive tech', () => {
    render(
      <TableLayout
        header={<div>HEADER</div>}
        itemCount={9}
        statusMessage="9 preparation methods"
      >
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      '9 preparation methods',
    )
  })

  it('the status region is visually hidden (sr-only)', () => {
    render(
      <TableLayout
        header={<div>HEADER</div>}
        itemCount={9}
        statusMessage="9 preparation methods"
      >
        <div>TABLE</div>
      </TableLayout>,
    )
    expect(screen.getByRole('status').className).toContain('sr-only')
  })
})
