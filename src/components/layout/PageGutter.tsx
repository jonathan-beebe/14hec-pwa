import { Outlet } from 'react-router-dom'

/**
 * Route wrapper that applies the standard page gutter (`px-8 py-6 max-w-7xl`)
 * around its child routes. Used for ordinary feature pages that aren't
 * canonical viewport-owning layouts.
 *
 * Canonical layouts (List + Detail, Picker + Detail, etc.) deliberately sit
 * outside this wrapper so they can own the viewport and manage their own
 * column scroll without inherited margins or width caps.
 */
export default function PageGutter() {
  return (
    <div className="px-8 py-6 max-w-7xl">
      <Outlet />
    </div>
  )
}
