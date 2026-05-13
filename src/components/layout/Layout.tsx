import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileTopBar, { MobileTopBarProvider } from './MobileTopBar'
import MobileNavDrawer from './MobileNavDrawer'

const DRAWER_ID = 'mobile-nav-drawer'

export default function Layout() {
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  useEffect(() => {
    const root = document.documentElement
    if (navOpen) root.classList.add('overflow-hidden')
    else root.classList.remove('overflow-hidden')
    return () => root.classList.remove('overflow-hidden')
  }, [navOpen])

  return (
    <MobileTopBarProvider>
      <div className="flex h-screen overflow-hidden relative bg-earth-950">
        {/* Skip link — first focusable element so keyboard users can
            bypass the sidebar's ~25 nav links on every page (WCAG 2.4.1).
            Hidden until focused; click handler moves focus into <main>
            programmatically because JSDOM and some browsers don't follow
            hash anchors into focus on focusable targets. */}
        <a
          href="#main-content"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('main-content')?.focus()
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:px-3 focus:py-2 focus:rounded-md focus:bg-earth-900 focus:text-earth-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400"
        >
          Skip to main content
        </a>

        {/* Aurora — living gradient background */}
        <div className="aurora-bg" />

        {/* Noise texture — analog warmth */}
        <div className="noise-overlay" />

        <Sidebar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 flex flex-col relative z-[1] min-h-0 min-w-0 focus:outline-none"
        >
          <MobileTopBar
            navOpen={navOpen}
            onMenuClick={() => setNavOpen((o) => !o)}
            drawerId={DRAWER_ID}
          />
          <div className="page-enter flex-1 overflow-y-auto min-h-0">
            <Outlet />
          </div>
          <div className="shrink-0 px-8 py-2">
            <p className="text-[10px] text-earth-600/60 leading-relaxed text-center tracking-wide">
              14 HEC is an educational reference database. It does not provide medical advice, diagnosis, or treatment.
              Consult a qualified healthcare provider before using any herbal substance.
              Statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </main>

        <MobileNavDrawer
          open={navOpen}
          onClose={() => setNavOpen(false)}
          id={DRAWER_ID}
        />
      </div>
    </MobileTopBarProvider>
  )
}
