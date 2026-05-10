import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface FlatListRowProps {
  /** Internal SPA route. Renders as `<Link>` so middle-click / cmd-click work. */
  to: string
  /** Left-side icon. Picks up `tintHex` via `currentColor`. */
  icon?: ReactNode
  /** Primary line — kept earth-100 for legibility regardless of tint. */
  primary: ReactNode
  /** Secondary line — earth-400. Optional. */
  secondary?: ReactNode
  /**
   * Locks the row in its engaged appearance (stronger inner glow + the
   * left-edge accent bar). Use to mark the active list item in a
   * list/detail layout.
   */
  selected?: boolean
  /**
   * Hex color (e.g. `#dc2626`) that drives the icon color, the engaged
   * inner glow, and the selected left-edge bar. Without it the engaged
   * state falls back to a neutral white wash.
   */
  tintHex?: string
  'aria-label'?: string
}

/**
 * Flat, edge-to-edge list row.
 *
 * Designed for list/sidebar surfaces where each item should read as
 * content-on-a-shared-surface rather than as a standalone card. At rest
 * the row is fully transparent — the surface tint comes from the
 * parent list container. Hover lifts a soft inner glow; selected makes
 * the glow tint-colored and adds a 3px left-edge accent bar.
 *
 * Pair with a tinted container (e.g. `<ul className="bg-earth-900/30">`)
 * so rest-state rows have something to sit on top of.
 */
export default function FlatListRow({
  to,
  icon,
  primary,
  secondary,
  selected,
  tintHex,
  'aria-label': ariaLabel,
}: FlatListRowProps) {
  const tinted = typeof tintHex === 'string' && tintHex.length > 0
  const [hovered, setHovered] = useState(false)
  const engaged = !!selected || hovered

  // Inner glow = blurred inset shadow (the "bloom") + a thin inset ring
  // (the edge). Tinted variant uses tintHex for both layers; neutral
  // falls back to white. Selected is a notch stronger than hover so the
  // active row reads at rest. Hex alpha suffixes: 1F≈12%, 26≈15%,
  // 33≈20%, 40=25%.
  let boxShadow: string | undefined
  if (selected) {
    boxShadow = tinted
      ? `inset 0 0 24px ${tintHex}33, inset 0 0 0 1px ${tintHex}40`
      : 'inset 0 0 24px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.18)'
  } else if (hovered) {
    boxShadow = tinted
      ? `inset 0 0 16px ${tintHex}1F, inset 0 0 0 1px ${tintHex}26`
      : 'inset 0 0 16px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.08)'
  }

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{ boxShadow }}
      className="relative flex items-center gap-4 px-6 py-4 transition-shadow duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:[outline-offset:-2px]"
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: tintHex || 'rgba(255,255,255,0.4)' }}
        />
      )}
      {icon !== undefined && (
        <div
          aria-hidden="true"
          className="text-3xl shrink-0 transition-opacity duration-200 motion-reduce:transition-none"
          style={{
            color: tinted ? tintHex : undefined,
            opacity: engaged ? 0.95 : 0.65,
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <div className="text-base font-system font-semibold tracking-tight text-earth-100">
          {primary}
        </div>
        {secondary !== undefined && (
          <div className="text-xs text-earth-400 leading-relaxed mt-0.5">
            {secondary}
          </div>
        )}
      </div>
    </Link>
  )
}
