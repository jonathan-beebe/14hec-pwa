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
 * Vertical navigation tile: icon, title, optional caption.
 *
 * Renders a real `<Link>` (anchor) so middle-click, ⌘-click, right-click → "Open in
 * new tab", and screen-reader "link" semantics all work.
 *
 * Prefer the variant subcomponents at call sites:
 *   `<LinkCard.Plain>`, `<LinkCard.Botanical>`, `<LinkCard.Celestial>`.
 *
 * Use the `tone` prop directly only when the tone is dynamic.
 *
 * @example
 * <LinkCard.Botanical to="/seasonal" icon="❁" title="Seasonal Guide"
 *   caption="Plants aligned with the current season" />
 *
 * <LinkCard.Celestial to="/astrology/natal-chart" icon="⭐" title="Astro-Botanical Chart"
 *   caption="Personalized plant map from your birth chart" />
 *
 * <LinkCard to={path} tone={isAstro ? 'celestial' : 'botanical'} ... />
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
