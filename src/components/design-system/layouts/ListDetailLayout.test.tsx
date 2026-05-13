import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ListDetailLayout from './ListDetailLayout'

function renderLayout(ui: React.ReactNode) {
  // ListDetailLayout uses react-router hooks via usePageMeta context, but
  // not directly in pure-layout mode; still, wrap in a router so any
  // descendant routing calls don't blow up.
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ListDetailLayout — slots', () => {
  it('renders top, list, and detail when detail is active', () => {
    renderLayout(
      <ListDetailLayout
        top={<div>TOP</div>}
        list={<div>LIST</div>}
        detail={<div>DETAIL</div>}
      />,
    )
    expect(screen.getByText('TOP')).toBeInTheDocument()
    expect(screen.getByText('LIST')).toBeInTheDocument()
    expect(screen.getByText('DETAIL')).toBeInTheDocument()
  })

  it('renders emptyDetail when detail is null', () => {
    renderLayout(
      <ListDetailLayout
        top={<div>TOP</div>}
        list={<div>LIST</div>}
        detail={null}
        emptyDetail={<div>EMPTY</div>}
      />,
    )
    expect(screen.getByText('LIST')).toBeInTheDocument()
    expect(screen.getByText('EMPTY')).toBeInTheDocument()
  })
})

describe('ListDetailLayout — optional filters slot', () => {
  it('renders the filters region when provided', () => {
    renderLayout(
      <ListDetailLayout
        top={<div>TOP</div>}
        filters={<div>FILTERS</div>}
        list={<div>LIST</div>}
        detail={null}
      />,
    )
    expect(screen.getByText('FILTERS')).toBeInTheDocument()
  })

  it('omits the filters region entirely when not provided', () => {
    renderLayout(
      <ListDetailLayout
        top={<div>TOP</div>}
        list={<div>LIST</div>}
        detail={null}
      />,
    )
    expect(screen.queryByText('FILTERS')).toBeNull()
  })

  it('hides the filters region on mobile when detail is active (follows the list)', () => {
    renderLayout(
      <ListDetailLayout
        top={<div>TOP</div>}
        filters={<div data-testid="filters">FILTERS</div>}
        list={<div>LIST</div>}
        detail={<div>DETAIL</div>}
      />,
    )
    // The filters wrapper carries `hidden lg:block` (matching the top
    // slot's mobile-hide behavior). Assert by class membership on the
    // immediate parent of the slot's content.
    const filtersContent = screen.getByTestId('filters')
    const wrapper = filtersContent.parentElement
    if (!wrapper) throw new Error('expected filters slot to have a wrapper element')
    expect(wrapper.className).toContain('hidden')
    expect(wrapper.className).toContain('lg:block')
  })

  it('keeps the filters region visible on mobile when detail is not active', () => {
    renderLayout(
      <ListDetailLayout
        top={<div>TOP</div>}
        filters={<div data-testid="filters">FILTERS</div>}
        list={<div>LIST</div>}
        detail={null}
      />,
    )
    const filtersContent = screen.getByTestId('filters')
    const wrapper = filtersContent.parentElement
    if (!wrapper) throw new Error('expected filters slot to have a wrapper element')
    expect(wrapper.className).toContain('block')
    expect(wrapper.className).not.toMatch(/(^|\s)hidden(\s|$)/)
  })
})
