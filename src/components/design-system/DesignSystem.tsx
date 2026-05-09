import TypographySection from './sections/TypographySection'
import AtomsSection from './sections/AtomsSection'
import ComponentsSection from './sections/ComponentsSection'
import LayoutsSection from './sections/LayoutsSection'

const navItems = [
  { id: 'typography', label: 'Typography' },
  { id: 'atoms', label: 'Atoms' },
  { id: 'components', label: 'Components' },
  { id: 'layouts', label: 'Layouts' },
]

export default function DesignSystem() {
  return (
    <div className="max-w-5xl px-8 py-6">
      <header className="mb-8 font-system">
        <p className="text-[10px] tracking-[0.25em] uppercase text-earth-500 mb-2">
          Internal {'·'} Dev only
        </p>
        <h1 className="text-3xl font-bold text-earth-100 tracking-tight">
          Design System
        </h1>
        <p className="text-earth-400 text-sm mt-2">
          Catalog of typography, atoms, components, and layouts used across 14 HEC.
        </p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2 font-system">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="text-xs uppercase tracking-[0.15em] text-earth-400 hover:text-earth-100 px-3 py-1.5 rounded-md border border-white/5 bg-earth-900/30 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <TypographySection />
      <AtomsSection />
      <ComponentsSection />
      <LayoutsSection />
    </div>
  )
}
