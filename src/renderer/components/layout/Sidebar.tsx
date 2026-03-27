import type { Page } from '../../App'

interface SidebarProps {
  currentView: string
  navigate: (page: Page) => void
}

interface NavSection {
  label?: string
  items: { view: Page['view']; label: string; icon: string }[]
}

const navSections: NavSection[] = [
  {
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: '\u2302' }
    ]
  },
  {
    label: 'Explore',
    items: [
      { view: 'plants', label: 'Plants', icon: '\u2618' },
      { view: 'ailments', label: 'Ailments', icon: '\u2695' },
      { view: 'wellness', label: 'Wellness Goals', icon: '\u2740' },
      { view: 'preparations', label: 'Preparations', icon: '\u2697' },
      { view: 'entheogenic', label: 'Entheogens', icon: '\u2604' },
      { view: 'body-systems', label: 'Body Systems', icon: '\u2B22' }
    ]
  },
  {
    label: 'Celestial',
    items: [
      { view: 'astrology', label: 'Signs & Planets', icon: '\u2609' },
      { view: 'natal-chart', label: 'Natal Chart', icon: '\u2B50' },
      { view: 'planetary-timing', label: 'Timing', icon: '\u231A' }
    ]
  },
  {
    label: 'Sanctuary',
    items: [
      { view: 'hmbs', label: 'Heart Mind Body Spirit', icon: '\u2726' },
      { view: 'seasonal', label: 'Seasonal Guide', icon: '\u2741' },
      { view: 'doctrine', label: 'Doctrine Explorer', icon: '\u2638' },
      { view: 'journal', label: 'Plant Journal', icon: '\u270E' }
    ]
  },
  {
    label: 'Tools',
    items: [
      { view: 'crossref', label: 'Cross-Reference', icon: '\u29D6' }
    ]
  }
]

const activeViews: Record<string, string> = {
  'plant-detail': 'plants',
  'ailment-detail': 'ailments',
  'body-system-detail': 'body-systems',
  'wellness-detail': 'wellness'
}

export default function Sidebar({ currentView, navigate }: SidebarProps) {
  const resolvedView = activeViews[currentView] || currentView

  return (
    <aside className="w-60 relative flex flex-col z-10"
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
            <p className="text-[9px] text-earth-500 tracking-[0.2em] uppercase">Herbal {'\u00b7'} Energetic {'\u00b7'} Celestial</p>
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
                <button
                  key={item.view}
                  onClick={() => navigate({ view: item.view } as Page)}
                  className={`sidebar-link w-full text-left ${
                    resolvedView === item.view ? 'active' : ''
                  }`}
                >
                  <span className={`sidebar-icon text-sm w-5 text-center ${
                    resolvedView === item.view ? 'opacity-90' : 'opacity-50'
                  }`}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
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
            Frequency {'\u00b7'} 14 HEC
          </p>
          <p className="text-[9px] text-earth-600/50 mt-0.5 font-display italic">
            "As above, so below"
          </p>
        </div>
      </div>
    </aside>
  )
}
