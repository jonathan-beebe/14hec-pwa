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
 * @deprecated Legacy pattern. Use `InfoTile.Heart` / `.Mind` / `.Body` /
 * `.Spirit` (domain → primary, description → secondary) for HMBS
 * navigation tiles going forward — `InfoTile.tsx` explicitly says it
 * merges the DomainCard shape into a single component. DomainCard leans
 * on the `.hmbs-card` + `.hmbs-{domain}` family in globals.css (Charter
 * Rule #1) and accepts inline unicode glyph strings as `icon` (Rule
 * #13). Retained only until the Dashboard is rebuilt against the
 * canonical Dashboard layout.
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
