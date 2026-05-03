import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Tone defines the stat number's color.
 */
export type StatCardTone = 'botanical' | 'celestial' | 'gold'

export interface StatCardProps {
  /** Internal SPA route. Rendered as a real `<a>` (react-router `<Link>`). */
  to: string
  tone?: StatCardTone
  icon?: ReactNode
  /** Stat value. Accepts a number, glyph, or any ReactNode (e.g. for non-numeric CTAs). */
  count: ReactNode
  label: ReactNode
  className?: string
}

type VariantStatCardProps = Omit<StatCardProps, 'tone'>

const toneNumberClass: Record<StatCardTone, string> = {
  botanical: 'text-botanical-400',
  celestial: 'text-celestial-400',
  gold: 'text-gold-400',
}

/**
 * Centered navigation tile with an icon, a large stat number, and a small
 * uppercase label.
 *
 * Renders `<Link>` (anchor) so middle-click, ⌘-click, right-click → "Open in
 * new tab", and screen-reader "link" semantics all work. `text-center` is
 * applied explicitly because `<a>` does not inherit the `<button>` default of
 * `text-align: center`.
 *
 * @example
 * <StatCard.Botanical to="/plants" icon="☘" count={207} label="Plants" />
 * <StatCard.Celestial to="/ailments" icon="⚕" count={75} label="Ailments" />
 * <StatCard tone="gold" to="/astrology" icon="☉" count={12} label="Zodiac" />
 */
function StatCard({
  to,
  tone = 'botanical',
  icon,
  count,
  label,
  className,
}: StatCardProps) {
  const cardClass = `card text-center group${className ? ` ${className}` : ''}`
  return (
    <Link to={to} className={cardClass}>
      {icon !== undefined && (
        <div className="text-xl mb-2 opacity-40 group-hover:opacity-70 transition-opacity duration-200">
          {icon}
        </div>
      )}
      <div className={`stat-number ${toneNumberClass[tone]}`}>{count}</div>
      <div className="text-[10px] text-earth-500 mt-1.5 tracking-[0.1em] uppercase">
        {label}
      </div>
    </Link>
  )
}

const Botanical = (props: VariantStatCardProps) => <StatCard {...props} tone="botanical" />
Botanical.displayName = 'StatCard.Botanical'

const Celestial = (props: VariantStatCardProps) => <StatCard {...props} tone="celestial" />
Celestial.displayName = 'StatCard.Celestial'

const Gold = (props: VariantStatCardProps) => <StatCard {...props} tone="gold" />
Gold.displayName = 'StatCard.Gold'

export default Object.assign(StatCard, { Botanical, Celestial, Gold })
