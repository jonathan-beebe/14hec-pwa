import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export interface BrowseTileProps {
  /** Internal SPA route. Renders as `<NavLink>` so the tile picks up an
   *  active style automatically when the URL matches (`aria-current="page"`). */
  to: string
  className?: string
  children: ReactNode
  /**
   * Explicit accessible name. Use when content uses non-textual elements
   * (badges, icons) and the visible text alone does not name the action
   * clearly.
   */
  'aria-label'?: string
}

/**
 * Catalog/list navigation tile. A quieter cousin of `InfoTile`: a
 * translucent black surface (a small darkening step beneath the page),
 * system font, no icon column, no gradient frame, no sand effect.
 * Shares InfoTile's interaction language — hover glow and a small
 * active scale-down — but stays calm so dozens of these can sit on a
 * page without the surface getting busy.
 *
 * Renders a real `<NavLink>` so middle-click, ⌘-click, right-click → "Open
 * in new tab", and screen-reader "link" semantics all work. Selection is
 * URL-driven: `aria-current="page"` stamps automatically when the URL
 * matches, which triggers the brighter botanical-tinted border + bg.
 *
 * Content is the consumer's call: title, latin name, body copy, badge
 * in the corner — passed as children. Default text inherits `font-system`
 * and `text-earth-200`; consumers compose from there.
 *
 * @example
 * <BrowseTile to={`/plants/${plant.id}`}>
 *   <span className="text-sm font-medium text-earth-100">{plant.common_name}</span>
 * </BrowseTile>
 */
export default function BrowseTile({ to, className, children, 'aria-label': ariaLabel }: BrowseTileProps) {
  // Frame: translucent black overlay on the page (`bg-black/20`) — a small
  // darkening step beneath whatever sits behind the tile, rather than a
  // stark pure-black panel. Hairline border and gentle inset highlight +
  // drop shadow at rest. `block w-full text-left` keeps the tile filling
  // its grid cell with content aligned the same as a sibling button would
  // have rendered.
  const frame =
    'block w-full text-left relative rounded-2xl p-4 bg-black/20 border border-white/[0.06] ' +
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),_0_4px_16px_-4px_rgba(0,0,0,0.5)]'
  // Hover: brighter botanical-tinted border + tone glow. No translateY lift —
  // the glow alone signals hover, keeping the tile calm.
  const hover =
    'hover:border-botanical-400/30 hover:shadow-glow-botanical'
  // Press: 2% scale-down + compressed glow, matching InfoTile's z-axis sink.
  // Tailwind emits active: after hover:, so the small glow wins on press.
  const press =
    'active:scale-[0.98] active:shadow-glow-botanical-sm'
  // Selected state. NavLink stamps `aria-current="page"` when the URL
  // matches; we hook that into a brighter bg + botanical-tinted border so
  // selection reads clearly without needing a persistent glow.
  const selected =
    'aria-[current=page]:bg-black/40 aria-[current=page]:border-botanical-400/40'
  // Keyboard focus: solid botanical-400 ring (~7:1 against the dark surface)
  // — meets WCAG 1.4.11 non-text contrast.
  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400'
  const motion =
    'transition-all duration-300 ease-out-expo motion-reduce:transition-none'
  const text = 'font-system text-earth-200'
  const cls = `${frame} ${motion} ${text} ${selected} ${hover} ${press} ${focus}${className ? ` ${className}` : ''}`

  return (
    <NavLink to={to} className={cls} aria-label={ariaLabel}>
      {children}
    </NavLink>
  )
}
