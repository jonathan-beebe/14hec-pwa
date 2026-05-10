import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface BrowseTileBaseProps {
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
 * Link mode: pass `to` for SPA navigation. Renders a `<NavLink>` so the
 * tile picks up an active/selected style automatically when the URL
 * matches (`aria-current="page"`).
 */
interface BrowseTileLinkProps extends BrowseTileBaseProps {
  to: string
  onClick?: undefined
  active?: undefined
}

/**
 * Button mode: pass `onClick` for state-driven selection (e.g., inline
 * detail panes, list/detail with local selectedId). Renders a `<button>`
 * and reflects selection via `aria-pressed={active}`.
 */
interface BrowseTileButtonProps extends BrowseTileBaseProps {
  onClick: () => void
  to?: undefined
  /** True when this tile is the currently selected item in its set. */
  active?: boolean
}

export type BrowseTileProps = BrowseTileLinkProps | BrowseTileButtonProps

/**
 * Catalog/list navigation tile. A quieter cousin of `InfoTile`: a
 * translucent black surface (a small darkening step beneath the page),
 * system font, no icon column, no gradient frame, no sand effect.
 * Shares InfoTile's interaction language — hover glow and a small
 * active scale-down — but stays calm so dozens of these can sit on a
 * page without the surface getting busy.
 *
 * Two modes:
 * - `to` → renders as react-router `<NavLink>` (catalog items routing to
 *   their own detail page, or list items in a List + Detail layout where
 *   the URL drives selection). Active state is auto-applied via
 *   `aria-current="page"` when the URL matches.
 * - `onClick` → renders as `<button>` (state-driven selection inside an
 *   inline-detail or list-detail view, where there's no URL change).
 *   Pass `active` to reflect selection — surfaced via `aria-pressed`.
 *
 * Active state: brighter botanical-tinted border + a touch more bg
 * opacity, so the selected item reads clearly against its siblings.
 *
 * Content is the consumer's call: title, latin name, body copy, badge
 * in the corner — passed as children. Default text inherits `font-system`
 * and `text-earth-200`; consumers compose from there.
 *
 * @example
 * <BrowseTile to={`/plants/${plant.id}`}>
 *   <span className="text-sm font-medium text-earth-100">{plant.common_name}</span>
 * </BrowseTile>
 *
 * <BrowseTile
 *   onClick={() => setSelectedId(plant.id)}
 *   active={selectedId === plant.id}
 * >
 *   <span className="text-sm font-medium text-earth-100">{plant.common_name}</span>
 * </BrowseTile>
 */
export default function BrowseTile(props: BrowseTileProps) {
  // Frame: translucent black overlay on the page (`bg-black/20`) — a small
  // darkening step beneath whatever sits behind the tile, rather than a
  // stark pure-black panel. Hairline border and gentle inset highlight +
  // drop shadow at rest. `w-full text-left` keeps button mode aligned the
  // same as link mode inside grid cells.
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
  // Selected state. Two ARIA hooks cover both modes:
  //   - NavLink stamps `aria-current="page"` when the URL matches.
  //   - Button mode sets `aria-pressed` from the `active` prop.
  // Tailwind has built-in `aria-pressed:` for true; the current variant
  // uses an arbitrary attribute selector. Both apply the same look:
  // brighter bg + botanical-tinted border, so selection reads clearly
  // without needing a persistent glow.
  const selected =
    'aria-[current=page]:bg-black/40 aria-[current=page]:border-botanical-400/40 ' +
    'aria-pressed:bg-black/40 aria-pressed:border-botanical-400/40'
  // Keyboard focus: solid botanical-400 ring (~7:1 against the dark surface)
  // — meets WCAG 1.4.11 non-text contrast.
  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400'
  const motion =
    'transition-all duration-300 ease-out-expo motion-reduce:transition-none'
  const text = 'font-system text-earth-200'
  const cls = `${frame} ${motion} ${text} ${selected} ${hover} ${press} ${focus}${props.className ? ` ${props.className}` : ''}`

  if (props.to !== undefined) {
    return (
      <NavLink to={props.to} className={cls} aria-label={props['aria-label']}>
        {props.children}
      </NavLink>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.active}
      className={`${cls} appearance-none`}
      aria-label={props['aria-label']}
    >
      {props.children}
    </button>
  )
}
