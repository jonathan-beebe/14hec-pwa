import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * One of the four HMBS sanctuary domains. Maps to per-domain background
 * gradients and title colors.
 */
export type Domain = 'heart' | 'mind' | 'body' | 'spirit'

export interface DomainCardProps {
  /** Internal SPA route. Rendered as a real `<a>` (react-router `<Link>`). */
  to: string
  domain: Domain
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  className?: string
}

const domainTitleClass: Record<Domain, string> = {
  heart: 'text-rose-300',
  mind: 'text-blue-300',
  body: 'text-green-300',
  spirit: 'text-purple-300',
}

/**
 * Centered navigation tile for an HMBS sanctuary domain. Background and
 * title color shift per domain (heart/mind/body/spirit) via the `.hmbs-card`
 * + `.hmbs-{domain}` CSS family.
 *
 * Renders `<Link>` (anchor) for proper navigation semantics. `text-center`
 * is applied explicitly because `<a>` does not inherit the `<button>` default
 * of `text-align: center`.
 *
 * @example
 * <DomainCard domain="heart" to="/hmbs" icon="♡" title="Heart"
 *   description="Love, connection, empathy" />
 */
export default function DomainCard({
  to,
  domain,
  icon,
  title,
  description,
  className,
}: DomainCardProps) {
  const cardClass = `hmbs-card hmbs-${domain} text-center${className ? ` ${className}` : ''}`
  return (
    <Link to={to} className={cardClass}>
      {icon !== undefined && (
        <div className="text-2xl mb-2 opacity-50">{icon}</div>
      )}
      <div className={`text-sm font-display font-semibold ${domainTitleClass[domain]}`}>
        {title}
      </div>
      {description !== undefined && (
        <p className="text-[10px] text-earth-500 mt-1 leading-relaxed">{description}</p>
      )}
    </Link>
  )
}
