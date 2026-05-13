import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Text from '../atoms/Text'
import Badge from '../atoms/Badge'

export interface CatalogHeaderProps {
  /** Page title rendered as `<h1>` via `Text.PageTitle`. */
  title: string
  /**
   * Current visible count. Rendered as a small badge next to the title.
   * Omit to suppress the count entirely.
   */
  count?: number
  /**
   * Total available before filtering. When both `count` and `total` are
   * present and differ, the badge reads `{count} of {total}` so the
   * filter pressure is visible at a glance. When they match the badge
   * shows the single number.
   */
  total?: number
  /** Optional short copy beneath the title. */
  subtitle?: ReactNode
  /**
   * Optional back-link rendered above the title as a small `← <label>`
   * affordance. Use for nested catalogs (e.g. a design-system demo
   * linking back to its catalog index). Omit for top-level pages whose
   * sidebar entry already names the destination.
   */
  backTo?: { to: string; label: string }
  /** Optional trailing action(s) (e.g. a "New" button). */
  actions?: ReactNode
  className?: string
}

function HeaderBadge({ count, total }: { count: number; total?: number }) {
  const text =
    total !== undefined && total !== count ? `${count} of ${total}` : `${count}`
  return <Badge.Conventional>{text}</Badge.Conventional>
}

/**
 * Canonical page header for the `header` slot of `CatalogLayout`. Pulls
 * the recurring shape — page title + (count / count-of-total) + optional
 * subtitle / back-link / actions — out of every feature so the layout
 * sets a consistent semantic structure (`<h1>` first, action region
 * second). Sits inside the layout's non-sticky header region; owns its
 * own gutters so the layout itself stays opinion-free about padding.
 */
export default function CatalogHeader({
  title,
  count,
  total,
  subtitle,
  backTo,
  actions,
  className,
}: CatalogHeaderProps) {
  const wrapper = ['px-4 md:px-8 pt-6 pb-4', className].filter(Boolean).join(' ')

  return (
    <header className={wrapper}>
      {backTo && (
        <Link
          to={backTo.to}
          className="text-[11px] text-earth-500 hover:text-earth-200 transition-colors"
        >
          {'← '}
          {backTo.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className={backTo ? 'mt-1' : undefined}>
          <div className="flex items-center gap-3">
            <Text.PageTitle>{title}</Text.PageTitle>
            {count !== undefined && <HeaderBadge count={count} total={total} />}
          </div>
          {subtitle !== undefined && (
            <p className="text-[11px] text-earth-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions !== undefined && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  )
}
