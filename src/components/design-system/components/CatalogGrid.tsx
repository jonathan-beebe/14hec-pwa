import type { ReactNode } from 'react'
import Text from '../atoms/Text'

export interface CatalogGridProps {
  children: ReactNode
  className?: string
}

/**
 * Responsive grid wrapper for `BrowseTile`s inside a `CatalogLayout`
 * `results` slot. 1 / 2 / 3 columns at sm / md / lg breakpoints, 12px
 * gap, and the canonical horizontal gutters + bottom padding so every
 * catalog ends with the same breathing room beneath the last row.
 *
 * Top padding is small (`pt-3`) because the sticky filter bar sits
 * directly above; if the consumer renders the grid without a filter
 * bar (a static catalog), pass a `className` override or wrap with
 * extra spacing.
 */
export function CatalogGrid({ children, className }: CatalogGridProps) {
  const cls = [
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3',
    'px-8 pt-3 pb-8',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div className={cls}>{children}</div>
}

export interface CatalogGroupProps {
  /** Group heading, rendered as `<h2>` to nest under `CatalogHeader`'s `<h1>`. */
  heading: ReactNode
  children: ReactNode
}

/**
 * One labeled group inside a `CatalogGroupedResults`. Renders the
 * heading as an `<h2>` (using `Text.SectionLabel`'s small eyebrow
 * treatment so the page's `<h1>` stays dominant) followed by the
 * group's contents — typically a `CatalogGrid` of `BrowseTile`s.
 *
 * Owns its own horizontal gutters so the heading aligns with the
 * grid beneath it.
 */
export function CatalogGroup({ heading, children }: CatalogGroupProps) {
  return (
    <section>
      <div className="px-8 pt-2">
        <Text.SectionLabel as="h2" className="text-sm">
          {heading}
        </Text.SectionLabel>
      </div>
      {children}
    </section>
  )
}

export interface CatalogGroupedResultsProps {
  children: ReactNode
  className?: string
}

/**
 * Vertical stack of `CatalogGroup`s for catalogs whose results are
 * naturally grouped (e.g. ailments by body system, body systems by
 * category). Owns the spacing between groups so consumers compose
 * groups linearly without juggling margins.
 *
 * The grouping is a presentation concern; filtering still happens
 * upstream against a flat list of items.
 */
export function CatalogGroupedResults({
  children,
  className,
}: CatalogGroupedResultsProps) {
  const cls = ['flex flex-col gap-6 pb-8', className]
    .filter(Boolean)
    .join(' ')
  return <div className={cls}>{children}</div>
}
