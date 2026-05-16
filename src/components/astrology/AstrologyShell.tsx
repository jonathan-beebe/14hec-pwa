import { Outlet } from 'react-router-dom'
import Text from '@/components/design-system/atoms/Text'

/**
 * Shell for /astrology/signs and /astrology/planets. Renders a shared
 * header above the per-view list/detail layout so the title stays put as
 * the user moves between sub-areas.
 *
 * The header overlays the list/detail panes with a translucent, blurred
 * background so content scrolls beneath it. On mobile it's `sticky` to
 * the page-level scroller; on desktop it's `absolute` over the layout
 * (which has its own per-pane scrollers) — child views compensate with
 * `topInset={ASTROLOGY_TOP_INSET}` on `RoutedListDetailLayout`.
 */
export default function AstrologyShell() {
  return (
    <div className="relative lg:h-full">
      <header className="sticky top-0 z-10 lg:absolute lg:inset-x-0 px-8 pt-6 pb-4 border-b border-white/5 bg-earth-950/60 backdrop-blur-md">
        <Text.Display>Astrology</Text.Display>
        <p className="text-base text-earth-500 mt-1">
          Celestial correspondences for plant medicine
        </p>
      </header>
      <Outlet />
    </div>
  )
}
