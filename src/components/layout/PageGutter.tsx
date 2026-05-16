import { Outlet } from 'react-router-dom'

/**
 * Route wrapper that applies the standard page gutter (`px-8 py-6 max-w-7xl`)
 * around its child routes. Used for ordinary feature pages that aren't
 * canonical viewport-owning layouts.
 *
 * Canonical layouts (Catalog → Detail, List + Detail, Picker + Detail)
 * deliberately sit outside this wrapper so they can own the viewport and
 * manage their own scroll without inherited margins or width caps. Slot
 * content inside those layouts provides its own gutters.
 */
export default function PageGutter() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl">
      <Outlet />
    </div>
  )
}
