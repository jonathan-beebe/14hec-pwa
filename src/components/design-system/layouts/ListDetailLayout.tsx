import { useEffect, useRef, type ReactNode } from 'react'
import {
  useLocation,
  useOutlet,
  useResolvedPath,
} from 'react-router-dom'
import { usePageMeta } from '@/components/layout/MobileTopBar'

export interface ListDetailLayoutProps {
  /** Optional content rendered full-width above the list/detail row. */
  top?: ReactNode
  /**
   * Optional filter / search region rendered full-width below `top` and
   * above the list/detail row. Sticky on desktop so the filters stay
   * pinned while the list scrolls beneath. On mobile the region follows
   * the list — visible when looking at the list, hidden when detail is
   * active. Omit when the feature has no filters.
   */
  filters?: ReactNode
  /** Content for the left list column. */
  list: ReactNode
  /**
   * The detail content. Truthy = detail is active (mobile swaps to detail
   * with the global top bar's back button). Null/undefined = no detail
   * (mobile shows top + list, desktop shows `emptyDetail` in the right
   * column).
   */
  detail?: ReactNode | null
  /** Rendered in the detail area when `detail` is null/undefined (desktop). */
  emptyDetail?: ReactNode
  /**
   * Render hairline dividers between regions (sidebar/detail seam). Default
   * `false` (borderless). Set `true` when the consumer wants the seam visible.
   */
  dividers?: boolean
  /**
   * Identifier of the currently shown detail. When this value changes, the
   * detail pane's scroll position is reset to the top. Pass the URL
   * pathname, the selected id, or any value that uniquely identifies the
   * active detail.
   */
  detailKey?: string | number | null
  /**
   * Tailwind class string controlling the desktop list column's width.
   * Defaults to `lg:w-[30%] lg:max-w-[360px]` — fine for compact list
   * items like `BrowseTile`. Bump to e.g. `lg:w-[40%] lg:max-w-[520px]`
   * when the list cells are wider (icon-on-left tile shapes, etc).
   */
  sidebarWidthClass?: string
  /**
   * Tailwind class string applied to both the list and detail scroll
   * panes, typically a `pt-*` value. Use when the consumer renders an
   * overlay header above the layout and content needs to start below
   * it (while still scrolling beneath). Pass a responsive value like
   * `lg:pt-28` if the header only overlays on desktop.
   */
  topInset?: string
}

/**
 * Canonical List + Detail layout primitive.
 *
 * Three slots: top (optional, full-width), list (left column), and detail
 * (right column on desktop, full-screen on mobile when active). Pure layout
 * — no routing dependency. For route-driven usage compose with
 * `RoutedListDetailLayout`.
 *
 * On mobile the back-from-detail affordance is the global top bar (see
 * `MobileTopBar`). State-driven consumers (no URL routing) should render
 * their own back affordance inside the detail pane.
 */
export default function ListDetailLayout({
  top,
  filters,
  list,
  detail,
  emptyDetail,
  dividers = false,
  detailKey,
  sidebarWidthClass = 'lg:w-[30%] lg:max-w-[360px]',
  topInset = '',
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

      {filters !== undefined && (
        <div
          className={`${isDetailActive ? 'hidden' : 'block'} lg:block lg:shrink-0 lg:sticky lg:top-0 lg:z-10`}
        >
          {filters}
        </div>
      )}

      <div className="lg:flex lg:flex-1 lg:min-h-0">
        <aside
          className={`${isDetailActive ? 'hidden' : 'block'} lg:block ${sidebarWidthClass} lg:overflow-y-auto ${sidebarBorder} ${topInset}`}
        >
          {list}
        </aside>

        <section
          ref={detailRef}
          className={`${isDetailActive ? 'block' : 'hidden'} lg:block lg:flex-1 lg:overflow-y-auto ${topInset}`}
        >
          {isDetailActive ? detail : emptyDetail}
        </section>
      </div>
    </div>
  )
}

/**
 * Route-driven sugar over `ListDetailLayout`. Pulls detail content from the
 * matched child route (`<Outlet />`) and contributes a `back` path to the
 * mobile top bar so the global hamburger swaps to ← while a detail is
 * active. Mount inside any layout route that defines a `:id` (or `:slug`)
 * child route.
 *
 * "Detail is active" is decided by URL depth, not by `useOutlet()`. A child
 * `<Route index element={null} />` would otherwise make `useOutlet()` return
 * a truthy `<RouteContext.Provider>` wrapping null, which would put mobile
 * into a back-button-with-empty-content state.
 */
export function RoutedListDetailLayout(
  props: Omit<ListDetailLayoutProps, 'detail'>,
) {
  const outlet = useOutlet()
  const location = useLocation()

  const layoutPath = useResolvedPath('.').pathname.replace(/\/$/, '')
  const currentPath = location.pathname.replace(/\/$/, '')
  const isDetailActive = currentPath !== layoutPath

  // Strip the last URL segment to land on the list. We compute the
  // parent path explicitly rather than using
  // `navigate('..', { relative: 'path' })` because react-router's
  // relative resolution can land elsewhere depending on route nesting.
  // Walking `location.pathname` is unambiguous regardless of where the
  // layout is mounted.
  const parentPath =
    location.pathname.replace(/\/[^/]+\/?$/, '') || '/'

  // Contribute the back path to the global mobile top bar. Title is left
  // for the page or detail component to set independently.
  usePageMeta({ back: isDetailActive ? parentPath : null })

  return (
    <ListDetailLayout
      {...props}
      detail={isDetailActive ? outlet : null}
    />
  )
}
