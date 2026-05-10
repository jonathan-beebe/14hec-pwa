import type { ReactNode } from 'react'

export interface CatalogLayoutProps {
  /** Page chrome at the top: title, count, optional action. Not sticky. */
  header: ReactNode
  /**
   * Filter controls. Stays pinned to the top of the layout's own scroll
   * region while results scroll beneath. Content is the consumer's choice
   * — a `<FilterBar>` later, an inline row of inputs for now. The layout
   * gives the sticky region a subtle opaque backdrop so scrolling content
   * does not bleed through; the filter slot's own surface (glass-panel,
   * etc.) sits on top of that.
   */
  filters: ReactNode
  /**
   * The results region: a flat grid, a grouped grid, a table — anything.
   * Rendered when `itemCount > 0` (or always, if `empty` is omitted).
   */
  results: ReactNode
  /**
   * Rendered in place of `results` when `itemCount === 0`. Omit to always
   * show `results` (useful when the consumer renders its own zero state
   * inside `results`).
   */
  empty?: ReactNode
  /** Drives the empty-state swap. */
  itemCount: number
}

/**
 * Canonical Catalog layout primitive.
 *
 * Three stacked regions inside a single owned-scroll column: header,
 * filters (sticky), results. Pure layout — no routing, no filter logic,
 * no opinion about what shape `results` takes. The list is grouping-
 * agnostic: pass a flat grid or a grouped tree, the layout treats them
 * the same.
 *
 * Detail navigation belongs to a separate route — Catalog → Detail. The
 * layout is just the list page; selecting an item is the consumer's job.
 *
 * Owns viewport scroll like `ListDetailLayout`. Sits inside any container
 * that provides height (typically `<main>`'s scroll region in
 * `Layout.tsx`). Routes consuming this primitive sit *outside*
 * `PageGutter` so the layout fills the available area; consumers provide
 * their own gutters/max-width inside slots.
 */
export default function CatalogLayout({
  header,
  filters,
  results,
  empty,
  itemCount,
}: CatalogLayoutProps) {
  const showEmpty = itemCount === 0 && empty !== undefined

  return (
    <div className="h-full flex flex-col overflow-y-auto animate-fade-in">
      {header}
      <div className="sticky top-0 z-10 bg-earth-950/80 backdrop-blur">{filters}</div>
      {showEmpty ? empty : results}
    </div>
  )
}
