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
 * When closed, the panel carries `inert` so its links are removed from
 * the tab order and the accessibility tree. `aria-hidden` is not used
 * for this purpose: combining it with focusable descendants is an ARIA
 * anti-pattern (WCAG 4.1.2). `inert` is the modern primitive built for
 * exactly this case (Chrome 102+, Safari 15.5+, Firefox 112+).
 *
 * The drawer body reuses `SidebarContent` so the nav definition lives in
 * exactly one place (`Sidebar.tsx`).
 */
export default function MobileNavDrawer({ open, onClose, id }: MobileNavDrawerProps) {
  return (
    <div className="lg:hidden">
      {/* Backdrop. Click closes. Decorative — hide from AT. */}
      <div
        aria-hidden
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel. Slides in from the left. Spread `inert` conditionally:
          React 18 does not serialize `inert={true}`, and @types/react@18
          does not yet include the `inert` HTML attribute. */}
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        {...(open ? {} : { inert: '' })}
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </div>
  )
}
