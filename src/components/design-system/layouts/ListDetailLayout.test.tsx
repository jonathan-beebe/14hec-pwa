import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ListDetailLayout, { RoutedListDetailLayout } from './ListDetailLayout'
import {
  MobileTopBarProvider,
  useMobileTopBarState,
} from '@/components/layout/MobileTopBar'

function renderLayout(ui: React.ReactNode) {
  // ListDetailLayout uses react-router hooks via usePageMeta context, but
  // not directly in pure-layout mode; still, wrap in a router so any
  // descendant routing calls don't blow up.
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function BackProbe() {
  const { back } = useMobileTopBarState()
  return <div data-testid="back-probe">{back ?? ''}</div>
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

describe('RoutedListDetailLayout — back path preserves filter search', () => {
  it('registered back path includes the current location.search', () => {
    render(
      <MemoryRouter initialEntries={['/things/42?q=yarrow&category=root']}>
        <MobileTopBarProvider>
          <BackProbe />
          <Routes>
            <Route
              path="/things"
              element={
                <RoutedListDetailLayout
                  list={<div>LIST</div>}
                  emptyDetail={<div>EMPTY</div>}
                />
              }
            >
              <Route path=":id" element={<div>DETAIL</div>} />
            </Route>
          </Routes>
        </MobileTopBarProvider>
      </MemoryRouter>,
    )

    const backPath = screen.getByTestId('back-probe').textContent ?? ''
    expect(backPath).toMatch(/^\/things\?/)
    expect(backPath).toContain('q=yarrow')
    expect(backPath).toContain('category=root')
  })

  it('registered back path is null when the layout is on the index route', () => {
    render(
      <MemoryRouter initialEntries={['/things']}>
        <MobileTopBarProvider>
          <BackProbe />
          <Routes>
            <Route
              path="/things"
              element={
                <RoutedListDetailLayout
                  list={<div>LIST</div>}
                  emptyDetail={<div>EMPTY</div>}
                />
              }
            >
              <Route path=":id" element={<div>DETAIL</div>} />
            </Route>
          </Routes>
        </MobileTopBarProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('back-probe').textContent).toBe('')
  })
})
