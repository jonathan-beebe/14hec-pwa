import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export interface TableColumn<T> {
  /** Stable identifier used for React keys and a11y. */
  key: string
  /** Visible column header on desktop; also the label on mobile cards. */
  header: string
  /** Renders the cell for a given row. */
  render: (row: T) => ReactNode
  /**
   * Promote this column to the row's headline on mobile. At most one
   * column should set `primary: true`; if none do, the mobile card has
   * no headline row and every column renders as a label/value pair.
   */
  primary?: boolean
  /**
   * Promote this column to the right side of the headline on mobile —
   * typically a badge or short status. At most one column should set
   * `badge: true`. The column also renders normally on desktop.
   */
  badge?: boolean
  /** Optional horizontal alignment on the desktop table. */
  align?: 'left' | 'right'
}

export interface RecordTableProps<T> {
  rows: T[]
  columns: TableColumn<T>[]
  /** React key for each row. */
  rowKey: (row: T) => string | number
  /** Route each row navigates to. Each row is a real `<NavLink>`. */
  rowHref: (row: T) => string
  /**
   * Accessible name for the row's link (composed into `aria-label` so a
   * screen-reader user hears something meaningful out of context, not the
   * concatenated row text). Typically the primary column's value.
   */
  rowLabel: (row: T) => string
  /** Optional caption announced before the table on screen readers. */
  caption?: string
  className?: string
}

function alignClass(align: TableColumn<unknown>['align']) {
  return align === 'right' ? 'text-right' : 'text-left'
}

/**
 * Responsive table primitive for the Table + Detail layout. Renders a
 * real `<table>` on `md:` and up for cross-row comparison; reflows into
 * a `<ul>` of `<dl>`-styled cards below `md:` so values stay legible on
 * phones.
 *
 * Each row is a `<NavLink>` to a per-row detail route. Middle-click /
 * ⌘-click / right-click → "Open in new tab" all work because the link
 * is a real anchor. On desktop the link is absolutely positioned to
 * cover the row so anywhere in the row is clickable; cell content sits
 * above it with `pointer-events: none` on the wrapping spans so clicks
 * fall through to the link.
 */
export default function RecordTable<T>({
  rows,
  columns,
  rowKey,
  rowHref,
  rowLabel,
  caption,
  className,
}: RecordTableProps<T>) {
  const primaryColumn = columns.find((c) => c.primary)
  const badgeColumn = columns.find((c) => c.badge)
  const restColumns = columns.filter(
    (c) => c !== primaryColumn && c !== badgeColumn,
  )

  const wrapperClass = ['w-full', className].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      {/* Desktop: real <table> inside a glass panel */}
      <div className="hidden md:block">
        <div className="rounded-2xl border border-white/[0.06] bg-black/20 backdrop-blur-md overflow-hidden">
          <table className="w-full text-sm">
            {caption && (
              <caption className="sr-only">{caption}</caption>
            )}
            <thead>
              <tr className="border-b border-white/[0.06]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={
                      'px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-earth-500 font-medium ' +
                      alignClass(col.align)
                    }
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  style={{ position: 'relative' }}
                  className={
                    'group transition-colors hover:bg-white/[0.03] ' +
                    'focus-within:bg-white/[0.04] ' +
                    (i < rows.length - 1
                      ? 'border-b border-white/[0.04]'
                      : '')
                  }
                >
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={
                        'px-4 py-3 text-earth-300 align-top ' +
                        alignClass(col.align)
                      }
                    >
                      {ci === 0 && (
                        <NavLink
                          to={rowHref(row)}
                          aria-label={rowLabel(row)}
                          className={
                            'absolute inset-0 z-0 ' +
                            'focus:outline-none ' +
                            'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-botanical-400/60 rounded-md'
                          }
                        />
                      )}
                      <span className="relative z-10 pointer-events-none">
                        {col.render(row)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="md:hidden flex flex-col gap-3 list-none">
        {rows.map((row) => (
          <li key={rowKey(row)}>
            <NavLink
              to={rowHref(row)}
              aria-label={rowLabel(row)}
              className={
                'block rounded-2xl bg-black/20 backdrop-blur-md border border-white/[0.06] p-4 ' +
                'hover:border-botanical-400/30 hover:shadow-glow-botanical ' +
                'active:scale-[0.99] transition-all duration-200 ease-out-expo ' +
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400 ' +
                'motion-reduce:transition-none'
              }
            >
              {(primaryColumn || badgeColumn) && (
                <div className="flex items-start justify-between gap-2 mb-3">
                  {primaryColumn && (
                    <span className="text-sm font-medium text-earth-100">
                      {primaryColumn.render(row)}
                    </span>
                  )}
                  {badgeColumn && (
                    <span className="shrink-0">{badgeColumn.render(row)}</span>
                  )}
                </div>
              )}
              <dl className="grid grid-cols-[max-content,1fr] gap-x-3 gap-y-1.5">
                {restColumns.map((col) => (
                  <div key={col.key} className="contents">
                    <dt className="text-[10px] text-earth-500 uppercase tracking-[0.15em] pt-0.5">
                      {col.header}
                    </dt>
                    <dd className="text-xs text-earth-300 leading-snug">
                      {col.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
