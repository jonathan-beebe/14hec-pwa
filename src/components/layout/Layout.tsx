import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden relative bg-earth-950">
      {/* Aurora — living gradient background */}
      <div className="aurora-bg" />

      {/* Noise texture — analog warmth */}
      <div className="noise-overlay" />

      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-[1]">
        <div className="px-8 py-6 max-w-7xl">
          <div className="page-enter">
            <Outlet />
          </div>
          {/* Persistent compliance footer */}
          <div className="mt-16 mb-6 pt-6 max-w-7xl">
            <div className="divider-gradient mb-4" />
            <p className="text-[10px] text-earth-600/60 leading-relaxed text-center tracking-wide">
              14 HEC is an educational reference database. It does not provide medical advice, diagnosis, or treatment.
              Consult a qualified healthcare provider before using any herbal substance.
              Statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
