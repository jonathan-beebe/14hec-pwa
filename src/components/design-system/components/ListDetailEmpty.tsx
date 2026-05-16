import type { ReactNode } from 'react'

export interface ListDetailEmptyProps {
  /** The prompt shown to the user, e.g. "Select a planet to view its correspondences." */
  message: ReactNode
  /**
   * Optional decorative glyph rendered above the message. A string
   * character (e.g. `'☉'`, `'✦'`) or any element. Marked `aria-hidden`
   * by this component — keep it purely visual.
   */
  icon?: ReactNode
  className?: string
}

/**
 * Canonical zero-state for the right pane of `ListDetailLayout` when no
 * detail is selected. Centered vertically and horizontally with a small,
 * dimmed decorative glyph above a single sentence. Use this for every
 * list/detail screen so the empty state reads the same across the app.
 */
export default function ListDetailEmpty({
  message,
  icon,
  className,
}: ListDetailEmptyProps) {
  const wrapper = [
    'h-full flex items-center justify-center px-6 py-16 text-center text-earth-500 text-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapper}>
      <div>
        {icon !== undefined && (
          <div className="text-4xl mb-3 opacity-20" aria-hidden>
            {icon}
          </div>
        )}
        {message}
      </div>
    </div>
  )
}
