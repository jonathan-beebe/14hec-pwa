import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import Button from '../atoms/Button'
import { Icon } from '../atoms/Icon'

export interface ListDetailLayoutProps {
  /** Optional content rendered full-width above the list/detail row. */
  top?: ReactNode
  /** Content for the left list column. */
  list: ReactNode
  /**
   * The detail content. Truthy = detail is active (mobile swaps to detail
   * with a back button). Null/undefined = no detail (mobile shows top + list,
   * desktop shows `emptyDetail` in the right column).
   */
  detail?: ReactNode | null
  /** Rendered in the detail area when `detail` is null/undefined (desktop). */
  emptyDetail?: ReactNode
  /** Called when the mobile back button is pressed. */
  onBack?: () => void
  /**
   * Render hairline dividers between regions (sidebar/detail seam, mobile
   * back-bar baseline). Default `true`. Set `false` when the consumer prefers
   * a borderless presentation.
   */
  dividers?: boolean
  /**
   * Identifier of the currently shown detail. When this value changes, the
   * detail pane's scroll position is reset to the top. Pass the URL
   * pathname, the selected id, or any value that uniquely identifies the
   * active detail.
   */
  detailKey?: string | number | null
}

/**
 * Canonical List + Detail layout primitive.
 *
 * Three slots: top (optional, full-width), list (left column), and detail
 * (right column on desktop, full-screen on mobile when active). Pure layout
 * — no routing dependency. For route-driven usage compose with
 * `RoutedListDetailLayout`.
 *
 * The layout owns scroll on each column and adds zero padding or margin to
 * slot content. Sits inside any container that provides height (h-full of
 * parent on desktop).
 */
export default function ListDetailLayout({
  top,
  list,
  detail,
  emptyDetail,
  onBack,
  dividers = true,
  detailKey,
}: ListDetailLayoutProps) {
  const isDetailActive = detail !== null && detail !== undefined
  const sidebarBorder = dividers ? 'lg:border-r lg:border-white/5' : ''
  const detailRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (detailRef.current) detailRef.current.scrollTop = 0
  }, [detailKey])

  return (
    <div className="lg:h-full lg:flex lg:flex-col">
      {top && (
        <div className={`${isDetailActive ? 'hidden' : 'block'} lg:block lg:shrink-0`}>
          {top}
        </div>
      )}

      <div className="lg:flex lg:flex-1 lg:min-h-0">
        <aside
          className={`${isDetailActive ? 'hidden' : 'block'} lg:block lg:w-[30%] lg:max-w-[360px] lg:overflow-y-auto ${sidebarBorder}`}
        >
          {list}
        </aside>

        <section
          ref={detailRef}
          className={`${isDetailActive ? 'block' : 'hidden'} lg:block lg:flex-1 lg:overflow-y-auto`}
        >
          {isDetailActive && onBack && <MobileBackBar onBack={onBack} divider={dividers} />}
          {isDetailActive ? detail : emptyDetail}
        </section>
      </div>
    </div>
  )
}

function MobileBackBar({ onBack, divider }: { onBack: () => void; divider: boolean }) {
  const borderClass = divider ? 'border-b border-white/5' : ''
  return (
    <div className={`lg:hidden sticky top-0 z-10 bg-earth-950/90 backdrop-blur ${borderClass} px-2 py-1.5`}>
      <Button.Ghost onClick={onBack} aria-label="Back to list">
        <Icon.ArrowLeft className="mr-1.5" /> Back
      </Button.Ghost>
    </div>
  )
}

/**
 * Route-driven sugar over `ListDetailLayout`. Pulls detail content from the
 * matched child route (`<Outlet />`) and wires the mobile back button to
 * the parent URL. Use inside any layout route that defines an index +
 * `:id` child route.
 */
export function RoutedListDetailLayout(
  props: Omit<ListDetailLayoutProps, 'detail' | 'onBack'>,
) {
  const detail = useOutlet()
  const navigate = useNavigate()
  const location = useLocation()

  // Strip the last URL segment to land on the list. We compute the
  // parent path explicitly rather than using
  // `navigate('..', { relative: 'path' })` because `useNavigate` here
  // sits in the *parent* route's element, where react-router's relative
  // resolution can land elsewhere depending on route nesting. Walking
  // `location.pathname` is unambiguous regardless of where the layout
  // is mounted.
  const onBack = () => {
    const parentPath = location.pathname.replace(/\/[^/]+\/?$/, '') || '/'
    navigate(parentPath)
  }

  return (
    <ListDetailLayout
      {...props}
      detail={detail}
      onBack={onBack}
    />
  )
}
