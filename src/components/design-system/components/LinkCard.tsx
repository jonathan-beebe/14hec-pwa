import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Tone defines the card's visual treatment.
 * - `plain`     — neutral surface; title hovers to botanical accent.
 * - `botanical` — botanical-glow surface; title shifts within the green palette.
 * - `celestial` — celestial-glow surface; title shifts within the purple palette.
 */
export type LinkCardTone = 'plain' | 'botanical' | 'celestial'

export interface LinkCardProps {
  /** Internal SPA route to navigate to. Rendered as a real `<a>` (react-router `<Link>`). */
  to: string
  tone?: LinkCardTone
  icon?: ReactNode
  title: ReactNode
  caption?: ReactNode
  className?: string
}

type VariantLinkCardProps = Omit<LinkCardProps, 'tone'>

const toneCardClass: Record<LinkCardTone, string> = {
  plain: 'card',
  botanical: 'card-glow-botanical',
  celestial: 'card-glow-celestial',
}

const toneTitleClass: Record<LinkCardTone, string> = {
  plain: 'text-earth-200 group-hover:text-botanical-400',
  botanical: 'text-botanical-400 group-hover:text-botanical-300',
  celestial: 'text-celestial-400 group-hover:text-celestial-300',
}

/**
 * @deprecated Legacy pattern. Use `InfoTile` for navigation tiles going
 * forward. `LinkCard` leans on the globals.css `.card-glow-*` family
 * (Charter Rule #1 violation), composes `font-display` titles instead
 * of the `Type` scale (principle #7), and uses inline unicode glyphs
 * at call sites instead of `Icon.X` components (Rule #13). Retained
 * only until the Dashboard is rebuilt against the canonical Dashboard
 * layout.
 */
function LinkCard({
  to,
  tone = 'plain',
  icon,
  title,
  caption,
  className,
}: LinkCardProps) {
  const cardClass = `${toneCardClass[tone]} text-left group${className ? ` ${className}` : ''}`
  return (
    <Link to={to} className={cardClass}>
      {icon !== undefined && (
        <div className="text-xl mb-2 opacity-40 group-hover:opacity-70 transition-opacity duration-200">
          {icon}
        </div>
      )}
      <div className={`text-sm font-display font-medium transition-colors ${toneTitleClass[tone]}`}>
        {title}
      </div>
      {caption !== undefined && (
        <p className="text-[10px] text-earth-500 mt-1.5 leading-relaxed">{caption}</p>
      )}
    </Link>
  )
}

const Plain = (props: VariantLinkCardProps) => <LinkCard {...props} tone="plain" />
Plain.displayName = 'LinkCard.Plain'

const Botanical = (props: VariantLinkCardProps) => <LinkCard {...props} tone="botanical" />
Botanical.displayName = 'LinkCard.Botanical'

const Celestial = (props: VariantLinkCardProps) => <LinkCard {...props} tone="celestial" />
Celestial.displayName = 'LinkCard.Celestial'

export default Object.assign(LinkCard, { Plain, Botanical, Celestial })
