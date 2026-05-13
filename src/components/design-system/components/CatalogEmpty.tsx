import type { ReactNode } from 'react'

export interface CatalogEmptyProps {
  /** Sentence shown to the user. Should match the screen-reader copy. */
  message: ReactNode
  /**
   * Optional decorative glyph above the message. Marked `aria-hidden`
   * by the consumer; this component does not wrap it. Keep it small.
   */
  icon?: ReactNode
  /**
   * If provided, renders a "Clear filters" button beneath the
   * message that invokes the callback. Omit for empty states that
   * cannot be cleared (e.g. a user-owned collection with zero
   * entries — show a "Create" action instead via `actions`).
   */
  onClear?: () => void
  /**
   * Optional trailing action(s) — used when the empty state is
   * actionable but not via "clear filters" (e.g. a Create button
   * for a brand-new collection).
   */
  actions?: ReactNode
  className?: string
}

/**
 * Canonical zero-state panel for the `empty` slot of `CatalogLayout`.
 * Glass surface matching the FilterBar's wrapper, centered message,
 * optional decorative glyph above, and a Clear-filters affordance
 * styled to match the FilterBar's Clear so the two read as a pair.
 *
 * The screen-reader announcement comes from `CatalogLayout`'s
 * `statusMessage` (role="status"). This panel is purely visual — the
 * `<p>` is the same copy as the announcement but with a trailing
 * period, deliberate so users hearing both don't get a double
 * announcement of identical strings.
 */
export default function CatalogEmpty({
  message,
  icon,
  onClear,
  actions,
  className,
}: CatalogEmptyProps) {
  const wrapper = ['px-4 md:px-8 pt-3 pb-8', className].filter(Boolean).join(' ')

  return (
    <div className={wrapper}>
      <div className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/[0.06] p-10 text-center">
        {icon !== undefined && (
          <div className="mb-2 opacity-40" aria-hidden>
            {icon}
          </div>
        )}
        <p className="text-sm text-earth-500 mb-2">{message}</p>
        {(onClear || actions) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className={
                  'text-xs text-earth-400 hover:text-earth-100 ' +
                  'rounded-md px-2 py-1.5 ' +
                  'focus:outline-none ' +
                  'focus-visible:ring-2 focus-visible:ring-botanical-400/60 ' +
                  'transition-colors'
                }
              >
                Clear filters
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
