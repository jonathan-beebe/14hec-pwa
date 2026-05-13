import { describe, it, expect } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render'
import Layout from './Layout'
import { usePageMeta } from './MobileTopBar'

function PageWithTitle({ title, back }: { title?: string; back?: string | null }) {
  usePageMeta({ title, back })
  return <div>Page body for {title ?? 'untitled'}</div>
}

function setup(initialEntries: string[] = ['/']) {
  return renderWithRouter(
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PageWithTitle title="Dashboard" />} />
        <Route path="/plants" element={<PageWithTitle title="Plants" />} />
        <Route
          path="/plants/:id"
          element={<PageWithTitle title="A Plant" back="/plants" />}
        />
      </Route>
    </Routes>,
    { initialEntries },
  )
}

describe('Layout — mobile top bar', () => {
  it('renders the page title from usePageMeta', async () => {
    setup(['/plants'])
    expect(await screen.findByRole('heading', { name: 'Plants' })).toBeInTheDocument()
  })

  it('shows the hamburger when no back is set', async () => {
    setup(['/plants'])
    expect(
      await screen.findByRole('button', { name: /open navigation menu/i }),
    ).toBeInTheDocument()
  })

  it('swaps the hamburger for a back button when back is set', async () => {
    setup(['/plants/42'])
    expect(await screen.findByRole('button', { name: /^back$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /open navigation menu/i })).toBeNull()
  })

  it('back button navigates to the configured path', async () => {
    const user = userEvent.setup()
    setup(['/plants/42'])

    const back = await screen.findByRole('button', { name: /^back$/i })
    await user.click(back)

    expect(await screen.findByRole('heading', { name: 'Plants' })).toBeInTheDocument()
  })
})

describe('Layout — mobile nav drawer (WCAG 2.4.3, 4.1.2)', () => {
  it('marks the panel inert when closed so links are not tab-reachable', async () => {
    setup(['/'])
    const panel = document.getElementById('mobile-nav-drawer')
    if (!panel) throw new Error('expected drawer panel in the document')
    expect(panel).toHaveAttribute('inert')
  })

  it('removes inert from the panel when the drawer is open', async () => {
    const user = userEvent.setup()
    setup(['/'])

    await user.click(
      await screen.findByRole('button', { name: /open navigation menu/i }),
    )

    const panel = document.getElementById('mobile-nav-drawer')
    if (!panel) throw new Error('expected drawer panel in the document')
    expect(panel).not.toHaveAttribute('inert')
  })
})

describe('Layout — skip link (WCAG 2.4.1)', () => {
  it('renders a "Skip to main content" link', async () => {
    setup(['/'])
    expect(
      await screen.findByRole('link', { name: /skip to main content/i }),
    ).toBeInTheDocument()
  })

  it('is the first focusable element in the layout', async () => {
    const user = userEvent.setup()
    setup(['/'])

    await user.tab()
    const skipLink = await screen.findByRole('link', {
      name: /skip to main content/i,
    })
    expect(skipLink).toHaveFocus()
  })

  it('moves focus into <main> when activated', async () => {
    const user = userEvent.setup()
    setup(['/'])

    const skipLink = await screen.findByRole('link', {
      name: /skip to main content/i,
    })
    await user.click(skipLink)

    const main = document.querySelector('main')
    if (!main) throw new Error('expected <main> in the document')
    expect(main).toHaveFocus()
    expect(main).toHaveAttribute('id', 'main-content')
  })
})

describe('Layout — sidebar landmark names (WCAG 1.3.1, 2.4.6)', () => {
  it('names the navigation landmark "Sections"', async () => {
    setup(['/'])
    // SidebarContent is rendered twice (desktop sidebar + mobile drawer);
    // each contains a <nav>. Both should carry the same accessible name.
    const navs = await screen.findAllByRole('navigation', { name: /sections/i })
    expect(navs.length).toBeGreaterThan(0)
  })

  it('names the desktop sidebar shell "Primary"', async () => {
    setup(['/'])
    const aside = await screen.findByRole('complementary', { name: /primary/i })
    expect(aside).toBeInTheDocument()
  })
})

describe('Layout — mobile nav drawer', () => {
  it('opens when the hamburger is clicked, closes on Escape', async () => {
    const user = userEvent.setup()
    setup(['/'])

    const hamburger = await screen.findByRole('button', { name: /open navigation menu/i })
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when the user navigates to a new route', async () => {
    const user = userEvent.setup()
    setup(['/'])

    const hamburger = await screen.findByRole('button', { name: /open navigation menu/i })
    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // The drawer renders SidebarContent which contains a Link to /plants.
    // Clicking it triggers navigation; the layout should close the drawer.
    const plantsLink = screen.getAllByRole('link', { name: /plants/i })[0]
    await user.click(plantsLink)

    expect(
      await screen.findByRole('button', { name: /open navigation menu/i }),
    ).toHaveAttribute('aria-expanded', 'false')
  })
})
