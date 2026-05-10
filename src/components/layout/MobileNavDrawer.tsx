import { SidebarContent } from './Sidebar'

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
  /** id wired to aria-controls on the trigger button. */
  id: string
}

/**
 * Slide-in mobile navigation drawer. Hidden on `lg+` where the desktop
 * sidebar is always visible. The drawer is always mounted so the slide
 * transition runs on both open and close — visibility is controlled
 * by `translate-x` and `pointer-events`.
 *
 * The drawer body reuses `SidebarContent` so the nav definition lives in
 * exactly one place (`Sidebar.tsx`).
 */
export default function MobileNavDrawer({ open, onClose, id }: MobileNavDrawerProps) {
  return (
    <div className="lg:hidden" aria-hidden={!open}>
      {/* Backdrop. Click closes. */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel. Slides in from the left. */}
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </div>
  )
}
