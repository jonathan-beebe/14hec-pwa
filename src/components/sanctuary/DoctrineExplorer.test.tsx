// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import { api } from '@/data/api'
import DoctrineExplorer from './DoctrineExplorer'
import DoctrineDetail from './DoctrineDetail'
import {
  MobileTopBarProvider,
  useMobileTopBarState,
} from '@/components/layout/MobileTopBar'

function BackProbe() {
  const { back } = useMobileTopBarState()
  return <div data-testid="back-probe">{back ?? ''}</div>
}

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>
  )
}

function renderDoctrineRoutes(initialEntry: string) {
  return renderWithRouter(
    <MobileTopBarProvider>
      <LocationProbe />
      <BackProbe />
      <Routes>
        <Route path="/doctrine" element={<DoctrineExplorer />}>
          <Route path=":plantId" element={<DoctrineDetail />} />
        </Route>
      </Routes>
    </MobileTopBarProvider>,
    { initialEntries: [initialEntry] },
  )
}

function probe() {
  return screen.getByTestId('location-probe').textContent ?? ''
}

describe('DoctrineExplorer', () => {
  it('renders the page title and the empty state on the index route', async () => {
    renderDoctrineRoutes('/doctrine')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /doctrine of plant teachings/i,
      }),
    ).toBeInTheDocument()

    expect(
      await screen.findByText(/select a plant teaching/i),
    ).toBeInTheDocument()
  })

  it('lists every teaching in the list pane', async () => {
    const teachings = await api.getAllTeachings()
    expect(teachings.length).toBeGreaterThan(0)
    renderDoctrineRoutes('/doctrine')

    const [first] = teachings
    if (!first) throw new Error('expected at least one teaching')

    expect(
      await screen.findByRole('link', { name: new RegExp(first.common_name, 'i') }),
    ).toBeInTheDocument()
  })

  it('renders the search filter in the layout header (top region), not inside the list pane', async () => {
    renderDoctrineRoutes('/doctrine')

    // FilterBar emits role="search". It should exist (we want it in the
    // top/filter slot, but role-based query is location-agnostic).
    expect(await screen.findByRole('search')).toBeInTheDocument()
  })

  it('typing in the search narrows the list and syncs to the URL', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')
    const query = target.common_name.slice(0, 4).toLowerCase()

    const user = userEvent.setup()
    renderDoctrineRoutes('/doctrine')

    await screen.findByRole('link', { name: new RegExp(target.common_name, 'i') })

    await user.type(screen.getByRole('searchbox', { name: /search/i }), query)

    await waitFor(() => {
      expect(probe()).toContain(`q=${query}`)
    })
  })

  it('clicking a list item navigates to /doctrine/:plantId and shows the detail', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')

    const user = userEvent.setup()
    renderDoctrineRoutes('/doctrine')

    const link = await screen.findByRole('link', {
      name: new RegExp(target.common_name, 'i'),
    })
    await user.click(link)

    await waitFor(() => {
      expect(probe()).toContain(`/doctrine/${target.plant_id}`)
    })

    // Detail header for the selected plant.
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: target.common_name,
      }),
    ).toBeInTheDocument()
  })

  it('deep-linking to /doctrine/:plantId hydrates the detail', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')

    renderDoctrineRoutes(`/doctrine/${target.plant_id}`)

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: target.common_name,
      }),
    ).toBeInTheDocument()
  })

  it('active domain is driven by the ?domain= URL param', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')

    renderDoctrineRoutes(`/doctrine/${target.plant_id}?domain=spiritual`)

    // The Spiritual tab is the active one (aria-selected via role="tab").
    const spiritualTab = await screen.findByRole('tab', {
      name: /spiritual/i,
      selected: true,
    })
    expect(spiritualTab).toBeInTheDocument()
  })

  it('preserves the filter URL when navigating to a teaching detail', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')
    // Pick a query that matches the target — first three characters are
    // enough for the existing seed data without coupling to a specific name.
    const query = target.common_name.slice(0, 3).toLowerCase()

    const user = userEvent.setup()
    renderDoctrineRoutes(`/doctrine?q=${query}`)

    const link = await screen.findByRole('link', {
      name: new RegExp(target.common_name, 'i'),
    })
    await user.click(link)

    await waitFor(() => {
      expect(probe()).toContain(`/doctrine/${target.plant_id}`)
      expect(probe()).toContain(`q=${query}`)
    })
  })

  it('mobile back path from a detail page preserves the active filter', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')

    renderDoctrineRoutes(`/doctrine/${target.plant_id}?q=yarrow`)

    await waitFor(() => {
      const backPath = screen.getByTestId('back-probe').textContent ?? ''
      expect(backPath).toMatch(/^\/doctrine\?/)
      expect(backPath).toContain('q=yarrow')
    })
  })

  it('clicking a domain tab updates the URL', async () => {
    const teachings = await api.getAllTeachings()
    const [target] = teachings
    if (!target) throw new Error('expected at least one teaching')

    const user = userEvent.setup()
    renderDoctrineRoutes(`/doctrine/${target.plant_id}`)

    const mentalTab = await screen.findByRole('tab', { name: /mental/i })
    await user.click(mentalTab)

    await waitFor(() => {
      expect(probe()).toContain('domain=mental')
    })
  })
})
