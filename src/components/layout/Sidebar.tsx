import { Link, useLocation } from 'react-router-dom'

interface NavSection {
  label?: string
  items: { view: string; route: string; label: string; icon: string }[]
}

const navSections: NavSection[] = [
  {
    items: [
      { view: 'dashboard', route: '/', label: 'Dashboard', icon: '⌂' }
    ]
  },
  {
    label: 'Explore',
    items: [
      { view: 'plants', route: '/plants', label: 'Plants', icon: '☘' },
      { view: 'ailments', route: '/ailments', label: 'Ailments', icon: '⚕' },
      { view: 'wellness', route: '/wellness', label: 'Wellness Goals', icon: '❀' },
      { view: 'preparations', route: '/preparations', label: 'Preparations', icon: '⚗' },
      { view: 'entheogenic', route: '/entheogens', label: 'Entheogens', icon: '☄' },
      { view: 'body-systems', route: '/body-systems', label: 'Body Systems', icon: '⬢' },
      { view: 'collections', route: '/collections', label: 'My Collections', icon: '♡' }
    ]
  },
  {
    label: 'Celestial',
    items: [
      { view: 'astrology', route: '/astrology', label: 'Signs & Planets', icon: '☉' },
      { view: 'natal-chart', route: '/natal-chart', label: 'Natal Chart', icon: '⭐' },
      { view: 'planetary-timing', route: '/planetary-timing', label: 'Timing', icon: '⌚' }
    ]
  },
  {
    label: 'Sanctuary',
    items: [
      { view: 'hmbs', route: '/hmbs', label: 'Heart Mind Body Spirit', icon: '✦' },
      { view: 'seasonal', route: '/seasonal', label: 'Seasonal Guide', icon: '❁' },
      { view: 'doctrine', route: '/doctrine', label: 'Doctrine Explorer', icon: '☸' },
      { view: 'journal', route: '/journal', label: 'Plant Journal', icon: '✎' }
    ]
  },
  {
    label: 'Tools',
    items: [
      { view: 'crossref', route: '/crossref', label: 'Cross-Reference', icon: '⧖' }
    ]
  },
  ...(import.meta.env.DEV
    ? [{
        label: 'Dev',
        items: [
          { view: 'design-system', route: '/design-system', label: 'Design System', icon: '▣' },
          { view: 'spike-planets', route: '/spike/planets', label: 'Planets Spike', icon: '♄' },
          { view: 'spike-astrology', route: '/spike/astrology', label: 'Astrology Spike', icon: '♈' }
        ]
      }]
    : []),
]

function isActive(pathname: string, route: string): boolean {
  if (route === '/') {
    return pathname === '/'
  }
  return pathname === route || pathname.startsWith(route + '/')
}

/**
 * The visual content of the sidebar (logo, nav, footer) wrapped in the
 * project's glass styling. Used by the desktop `Sidebar` shell and by
 * `MobileNavDrawer`. Fills the height of its parent.
 */
export function SidebarContent() {
  const { pathname } = useLocation()

  return (
    <div className="h-full flex flex-col"
         style={{
           background: 'rgba(16, 15, 12, 0.82)',
           backdropFilter: 'blur(24px) saturate(150%)',
           WebkitBackdropFilter: 'blur(24px) saturate(150%)',
           borderRight: '1px solid rgba(255, 255, 255, 0.06)'
         }}>

      {/* Logo */}
      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-display font-bold"
               style={{
                 background: 'linear-gradient(135deg, rgba(93, 168, 126, 0.15), rgba(124, 94, 237, 0.15))',
                 border: '1px solid rgba(93, 168, 126, 0.15)',
                 boxShadow: '0 0 20px rgba(93, 168, 126, 0.08)'
               }}>
            <span className="text-gradient-botanical">14</span>
          </div>
          <div>
            <h1 className="text-base font-display font-bold tracking-wider text-gradient-botanical">14 HEC</h1>
            <p className="text-[9px] text-earth-500 tracking-[0.2em] uppercase">Herbal {'·'} Energetic {'·'} Celestial</p>
          </div>
        </div>
        <div className="divider-gradient mt-4" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 overflow-y-auto scrollbar-hidden relative">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.label && (
              <div className="px-3 mb-1.5 text-[10px] text-earth-500 uppercase tracking-[0.15em] font-medium">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.view}
                  to={item.route}
                  className={`sidebar-link w-full text-left ${
                    isActive(pathname, item.route) ? 'active' : ''
                  }`}
                >
                  <span className={`sidebar-icon text-sm w-5 text-center ${
                    isActive(pathname, item.route) ? 'opacity-90' : 'opacity-50'
                  }`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative px-5 py-4">
        <div className="divider-gradient mb-3" />
        <div className="text-center">
          <p className="text-[9px] text-earth-600 tracking-[0.15em] uppercase">
            Frequency {'·'} 14 HEC
          </p>
          <p className="text-[9px] text-earth-600/50 mt-0.5 font-display italic">
            "As above, so below"
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 relative z-10">
      <SidebarContent />
    </aside>
  )
}
