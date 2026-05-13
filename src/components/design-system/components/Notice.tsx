import type { ReactNode } from 'react'

export type NoticeTone = 'caution' | 'info'

export interface NoticeProps {
  /**
   * Small accent-colored label above the body — typically a short noun
   * phrase ("Sacred Responsibility", "Safety notes"). Renders as a
   * `<strong>` for semantic emphasis without forcing a heading level.
   */
  title?: ReactNode
  /**
   * Visual treatment. `caution` (default) is amber — the established
   * voice for warnings and sacred-responsibility callouts. `info` is
   * blue, for neutral supplementary context.
   */
  tone?: NoticeTone
  /**
   * Decorative glyph at the start of the row. Defaults to the warning
   * sign for `caution` and an info dot for `info`. Pass any node to
   * override (kept `aria-hidden` regardless).
   */
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const toneClass: Record<NoticeTone, { panel: string; accent: string }> = {
  caution: {
    panel: 'bg-amber-500/[0.04] border-amber-500/10',
    accent: 'text-amber-400',
  },
  info: {
    panel: 'bg-blue-500/[0.04] border-blue-500/10',
    accent: 'text-blue-300',
  },
}

const defaultIcon: Record<NoticeTone, ReactNode> = {
  caution: '⚠',
  info: 'ⓘ',
}

/**
 * Amber-tinted (or blue, for `info`) supplementary callout. Use to flag
 * something the reader should hold in mind but that is not blocking and
 * is not part of the primary content flow — sacred-responsibility
 * advisories, safety notes, legal caveats.
 *
 * Renders as `<aside role="note">` so assistive tech announces it as
 * supplementary commentary rather than as a region heading. The title
 * is a `<strong>` rather than an `<h2>` so the surrounding page can
 * own heading hierarchy on its own terms.
 */
export default function Notice({
  title,
  tone = 'caution',
  icon,
  children,
  className,
}: NoticeProps) {
  const t = toneClass[tone]
  const wrapper = [
    'rounded-xl border p-4',
    t.panel,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside role="note" className={wrapper}>
      <div className="flex items-start gap-3">
        <span aria-hidden className={`shrink-0 text-sm ${t.accent}`}>
          {icon ?? defaultIcon[tone]}
        </span>
        <div className="min-w-0">
          {title !== undefined && (
            <strong
              className={`block text-[11px] font-medium tracking-wide mb-0.5 ${t.accent}`}
            >
              {title}
            </strong>
          )}
          <div className="text-[11px] text-earth-500 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </aside>
  )
}
