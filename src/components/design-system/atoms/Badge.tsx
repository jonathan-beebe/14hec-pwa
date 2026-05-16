import type { ReactNode } from 'react'

/**
 * Badge variants are organized by *semantic role*, not just color
 * (Charter Rule #7). Adding a new badge means picking a role; ad-hoc
 * one-off color combinations do not enter the system.
 *
 * - Category — the conventional/entheogenic/both axis on plants.
 * - Element — fire / water / air / earth.
 * - Domain — heart / mind / body / spirit (HMBS).
 * - Evidence — clinical / traditional / ethnobotanical / anecdotal.
 */
export type BadgeVariant =
  | 'conventional'
  | 'entheogenic'
  | 'both'
  | 'fire'
  | 'water'
  | 'air'
  | 'earth'
  | 'heart'
  | 'mind'
  | 'body'
  | 'spirit'
  | 'clinical'
  | 'traditional'
  | 'ethnobotanical'
  | 'anecdotal'

export interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

type VariantBadgeProps = Omit<BadgeProps, 'variant'>

const baseClass =
  'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-wide ring-1 ring-inset'

const variantClass: Record<BadgeVariant, string> = {
  // Category
  conventional: 'bg-botanical-500/10 text-botanical-300 ring-botanical-500/20',
  entheogenic: 'bg-celestial-500/10 text-celestial-300 ring-celestial-500/20',
  both: 'bg-gradient-to-br from-botanical-500/10 to-celestial-500/10 text-earth-200 ring-earth-500/20',
  // Element
  fire: 'bg-red-500/10 text-red-300 ring-red-500/20',
  water: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  air: 'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20',
  earth: 'bg-green-500/10 text-green-300 ring-green-500/20',
  // Domain (HMBS)
  heart: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  mind: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  body: 'bg-green-500/10 text-green-300 ring-green-500/20',
  spirit: 'bg-purple-500/10 text-purple-300 ring-purple-500/20',
  // Evidence
  clinical: 'bg-green-500/10 text-green-300 ring-green-500/20',
  traditional: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  ethnobotanical: 'bg-purple-500/10 text-purple-300 ring-purple-500/20',
  anecdotal: 'bg-earth-700/30 text-earth-400 ring-earth-600/20',
}

/**
 * Standard badge atom. Compound subcomponents express variants per
 * Charter Rule #3:
 *
 *   <Badge.Conventional>conventional</Badge.Conventional>
 *   <Badge.Heart>heart</Badge.Heart>
 *   <Badge.Clinical>clinical</Badge.Clinical>
 *
 * Pass `variant` directly only when the variant is genuinely dynamic
 * (e.g., driven by data: `<Badge variant={item.category}>{item.category}</Badge>`).
 */
function Badge({ variant = 'conventional', className, children }: BadgeProps) {
  const classes = `${baseClass} ${variantClass[variant]}${className ? ` ${className}` : ''}`
  return <span className={classes}>{children}</span>
}

const Conventional = (props: VariantBadgeProps) => <Badge {...props} variant="conventional" />
Conventional.displayName = 'Badge.Conventional'

const Entheogenic = (props: VariantBadgeProps) => <Badge {...props} variant="entheogenic" />
Entheogenic.displayName = 'Badge.Entheogenic'

const Both = (props: VariantBadgeProps) => <Badge {...props} variant="both" />
Both.displayName = 'Badge.Both'

const Fire = (props: VariantBadgeProps) => <Badge {...props} variant="fire" />
Fire.displayName = 'Badge.Fire'

const Water = (props: VariantBadgeProps) => <Badge {...props} variant="water" />
Water.displayName = 'Badge.Water'

const Air = (props: VariantBadgeProps) => <Badge {...props} variant="air" />
Air.displayName = 'Badge.Air'

const EarthEl = (props: VariantBadgeProps) => <Badge {...props} variant="earth" />
EarthEl.displayName = 'Badge.Earth'

const Heart = (props: VariantBadgeProps) => <Badge {...props} variant="heart" />
Heart.displayName = 'Badge.Heart'

const Mind = (props: VariantBadgeProps) => <Badge {...props} variant="mind" />
Mind.displayName = 'Badge.Mind'

const Body = (props: VariantBadgeProps) => <Badge {...props} variant="body" />
Body.displayName = 'Badge.Body'

const Spirit = (props: VariantBadgeProps) => <Badge {...props} variant="spirit" />
Spirit.displayName = 'Badge.Spirit'

const Clinical = (props: VariantBadgeProps) => <Badge {...props} variant="clinical" />
Clinical.displayName = 'Badge.Clinical'

const Traditional = (props: VariantBadgeProps) => <Badge {...props} variant="traditional" />
Traditional.displayName = 'Badge.Traditional'

const Ethnobotanical = (props: VariantBadgeProps) => <Badge {...props} variant="ethnobotanical" />
Ethnobotanical.displayName = 'Badge.Ethnobotanical'

const Anecdotal = (props: VariantBadgeProps) => <Badge {...props} variant="anecdotal" />
Anecdotal.displayName = 'Badge.Anecdotal'

export default Object.assign(Badge, {
  Conventional,
  Entheogenic,
  Both,
  Fire,
  Water,
  Air,
  Earth: EarthEl,
  Heart,
  Mind,
  Body,
  Spirit,
  Clinical,
  Traditional,
  Ethnobotanical,
  Anecdotal,
})
