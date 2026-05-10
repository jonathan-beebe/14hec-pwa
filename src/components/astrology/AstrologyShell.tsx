import { Outlet } from 'react-router-dom'
import Text from '@/components/design-system/atoms/Text'

/**
 * Shell for /astrology/signs and /astrology/planets. Renders a shared
 * header above the per-view list/detail layout so the title stays put as
 * the user moves between sub-areas.
 */
export default function AstrologyShell() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-8 pt-6 pb-4 shrink-0 border-b border-white/5">
        <Text.Display>Astrology</Text.Display>
        <p className="text-xs text-earth-500 mt-0.5">
          Celestial correspondences for plant medicine
        </p>
      </header>
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  )
}
