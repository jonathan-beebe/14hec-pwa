import { render, screen } from '@testing-library/react'
import CatalogLayout from './CatalogLayout'

describe('CatalogLayout — slots', () => {
  it('renders header, filters, and results when itemCount > 0', () => {
    render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={3}
      />,
    )
    expect(screen.getByText('HEADER')).toBeInTheDocument()
    expect(screen.getByText('FILTERS')).toBeInTheDocument()
    expect(screen.getByText('RESULTS')).toBeInTheDocument()
  })

  it('renders empty in place of results when itemCount is 0 and empty is provided', () => {
    render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        empty={<div>EMPTY</div>}
        itemCount={0}
      />,
    )
    expect(screen.queryByText('RESULTS')).toBeNull()
    expect(screen.getByText('EMPTY')).toBeInTheDocument()
  })

  it('keeps showing results when itemCount is 0 but no empty slot is provided', () => {
    render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={0}
      />,
    )
    expect(screen.getByText('RESULTS')).toBeInTheDocument()
  })
})

describe('CatalogLayout — status message (WCAG 4.1.3)', () => {
  it('does not render a status region when statusMessage is omitted', () => {
    render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={3}
      />,
    )
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders statusMessage inside a role="status" region for assistive tech', () => {
    render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={3}
        statusMessage="3 items"
      />,
    )
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('3 items')
  })

  it('updates the status region when the message changes', () => {
    const { rerender } = render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={3}
        statusMessage="3 items"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('3 items')

    rerender(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={1}
        statusMessage="1 item matches your filters"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      '1 item matches your filters',
    )
  })

  it('the status region is visually hidden (sr-only)', () => {
    render(
      <CatalogLayout
        header={<div>HEADER</div>}
        filters={<div>FILTERS</div>}
        results={<div>RESULTS</div>}
        itemCount={3}
        statusMessage="3 items"
      />,
    )
    expect(screen.getByRole('status').className).toContain('sr-only')
  })
})
