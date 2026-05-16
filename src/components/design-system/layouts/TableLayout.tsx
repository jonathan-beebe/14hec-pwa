import type { ReactNode } from 'react'

export interface TableLayoutProps {
  /** Page chrome at the top: title, count, optional action. Not sticky. */
  header: ReactNode
  /**
   * Optional filter / search controls, sticky to the top of the layout's
   * scroll region. Reference tables of small fixed sets typically omit
   * filters entirely; the sticky region is skipped when this slot is
   * absent.
   */
  filters?: ReactNode
  /**
   * The table itself. Typically a `<RecordTable>`, but any element is
   * accepted — the layout has no opinion about what shape `children`
   * takes beyond "it scrolls inside the layout's owned viewport."
   */
  children: ReactNode
  /**
   * Optional zero-state, rendered in place of `children` when
   * `itemCount === 0`. Same semantics as `CatalogLayout.empty`.
   */
  empty?: ReactNode
  /** Drives the empty-state swap. */
  itemCount: number
  /**
   * Optional `role="status"` announcement (WCAG 4.1.3). Same semantics
   * as `CatalogLayout.statusMessage` — typically a count summary
   * (`"9 preparation methods"`), only needed when the count can change
   * (filtering/searching). Omit for static tables.
   */
  statusMessage?: string
}

/**
 * Canonical Table + Detail layout primitive.
 *
 * Sibling of `CatalogLayout`. Use when the index view is a scannable
 * cross-row comparison rather than a card grid — homogeneous reference
 * data, six-or-fewer columns, where the user's question is "how does
 * row X stack up against row Y?" rather than "tell me about row X."
 * Selecting a row navigates to its own detail route, same as Catalog →
 * Detail; the list is not split-pane.
 *
 * Sits inside any container that provides height (typically `<main>`'s
 * scroll region in `Layout.tsx`). Routes consuming this primitive sit
 * outside `PageGutter` — the layout fills the available area and
 * children provide their own gutters.
 */
export default function TableLayout({
  header,
  filters,
  children,
  empty,
  itemCount,
  statusMessage,
}: TableLayoutProps) {
  const showEmpty = itemCount === 0 && empty !== undefined

  return (
    <div className="h-full flex flex-col overflow-y-auto animate-fade-in motion-reduce:animate-none">
      {header}
      {filters !== undefined && (
        <div className="sticky top-0 z-10">{filters}</div>
      )}
      {statusMessage !== undefined && (
        <div role="status" className="sr-only">
          {statusMessage}
        </div>
      )}
      {showEmpty ? empty : children}
    </div>
  )
}
