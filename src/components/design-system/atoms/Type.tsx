import type { ElementType, HTMLAttributes, ReactNode } from 'react'

/**
 * The 14 HEC type scale.
 *
 * Two families. The system stack is the default — calm, scannable, the
 * voice of content. Playfair Display is opt-in via `Type.Branded.X` —
 * the rare voice of identity, used at the few earned moments.
 *
 * See the Surfaces section of the design-system README for the registers
 * (branded / sacred / content) the type scale serves.
 *
 * @example
 * <Type.PageTitle>Plants</Type.PageTitle>
 * <Type.Body>Plants activate what is already within us.</Type.Body>
 * <Type.Branded.Display>14 HEC</Type.Branded.Display>
 * <Type.CardTitle>
 *   Yarrow <Type.Branded.Latin>Achillea millefolium</Type.Branded.Latin>
 * </Type.CardTitle>
 */
export type TypeVariant =
  | 'display'
  | 'page-title'
  | 'heading'
  | 'subheading'
  | 'section-title'
  | 'card-title'
  | 'body'
  | 'body-small'
  | 'caption'
  | 'section-label'
  | 'numeric'

export type BrandedTypeVariant =
  | 'display'
  | 'page-title'
  | 'heading'
  | 'latin'

export interface TypeProps extends HTMLAttributes<HTMLElement> {
  variant?: TypeVariant
  /** Override the semantic element. Each variant has a sensible default. */
  as?: ElementType
  className?: string
  children?: ReactNode
}

export interface BrandedTypeProps extends HTMLAttributes<HTMLElement> {
  variant?: BrandedTypeVariant
  as?: ElementType
  className?: string
  children?: ReactNode
}

type VariantProps = Omit<TypeProps, 'variant'>
type BrandedVariantProps = Omit<BrandedTypeProps, 'variant'>

// Color philosophy: heading-family variants (display through card-title)
// carry no color so consumers can override freely without specificity wars
// — they inherit `text-earth-100` from `body` in globals.css. The
// dim-register variants (body / body-small / caption / section-label) DO
// bake color because the dimming IS the variant's meaning, not a default
// to be overridden.
const variantClass: Record<TypeVariant, string> = {
  display:
    'font-system text-4xl font-bold tracking-tight leading-tight',
  'page-title':
    'font-system text-[28px] font-bold tracking-tight leading-tight',
  heading:
    'font-system text-[22px] font-semibold leading-snug',
  subheading:
    'font-system text-lg font-semibold leading-snug',
  'section-title':
    'font-system text-[17px] font-semibold leading-snug',
  'card-title':
    'font-system text-base font-semibold leading-snug',
  body:
    'font-system text-[15px] font-normal text-earth-200 leading-relaxed',
  'body-small':
    'font-system text-[13px] font-normal text-earth-300 leading-normal',
  caption:
    'font-system text-xs font-normal text-earth-400 leading-normal',
  'section-label':
    'font-system text-[11px] font-semibold uppercase tracking-wider text-earth-300',
  // Numeric is size-agnostic — it inherits family, size, and weight from
  // its container and only adds tabular figures so values align in lists,
  // tables, and stat cards.
  numeric: 'tabular-nums',
}

const variantElement: Record<TypeVariant, ElementType> = {
  display: 'h1',
  'page-title': 'h1',
  heading: 'h2',
  subheading: 'h3',
  'section-title': 'h2',
  'card-title': 'h3',
  body: 'p',
  'body-small': 'p',
  caption: 'span',
  'section-label': 'div',
  numeric: 'span',
}

// Branded variants share size with their system counterparts; the family
// carries the change in voice. Playfair at 600 reads with similar weight
// to system at 700, so we step down from system. Color follows the same
// rule as the system scale: branded titles carry no color and inherit
// `text-earth-100` from body, so call sites can apply tones (gradients,
// accents) without specificity wars.
const brandedClass: Record<BrandedTypeVariant, string> = {
  display:
    'font-display text-4xl font-semibold leading-tight',
  'page-title':
    'font-display text-[28px] font-semibold leading-tight',
  heading:
    'font-display text-[22px] font-semibold leading-snug',
  // Latin is size-agnostic — it inherits from its container so it can sit
  // inside a CardTitle, a Body paragraph, or a Display hero alike.
  latin: 'font-display italic font-medium',
}

const brandedElement: Record<BrandedTypeVariant, ElementType> = {
  display: 'h1',
  'page-title': 'h1',
  heading: 'h2',
  latin: 'span',
}

function Type({
  variant = 'body',
  as,
  className,
  children,
  ...rest
}: TypeProps) {
  const Component = as ?? variantElement[variant]
  const classes = className
    ? `${variantClass[variant]} ${className}`
    : variantClass[variant]
  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  )
}

function BrandedType({
  variant = 'display',
  as,
  className,
  children,
  ...rest
}: BrandedTypeProps) {
  const Component = as ?? brandedElement[variant]
  const classes = className
    ? `${brandedClass[variant]} ${className}`
    : brandedClass[variant]
  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  )
}

const Display = (props: VariantProps) => <Type {...props} variant="display" />
Display.displayName = 'Type.Display'

const PageTitle = (props: VariantProps) => <Type {...props} variant="page-title" />
PageTitle.displayName = 'Type.PageTitle'

const Heading = (props: VariantProps) => <Type {...props} variant="heading" />
Heading.displayName = 'Type.Heading'

const Subheading = (props: VariantProps) => <Type {...props} variant="subheading" />
Subheading.displayName = 'Type.Subheading'

const SectionTitle = (props: VariantProps) => <Type {...props} variant="section-title" />
SectionTitle.displayName = 'Type.SectionTitle'

const CardTitle = (props: VariantProps) => <Type {...props} variant="card-title" />
CardTitle.displayName = 'Type.CardTitle'

const Body = (props: VariantProps) => <Type {...props} variant="body" />
Body.displayName = 'Type.Body'

const BodySmall = (props: VariantProps) => <Type {...props} variant="body-small" />
BodySmall.displayName = 'Type.BodySmall'

const Caption = (props: VariantProps) => <Type {...props} variant="caption" />
Caption.displayName = 'Type.Caption'

const SectionLabel = (props: VariantProps) => <Type {...props} variant="section-label" />
SectionLabel.displayName = 'Type.SectionLabel'

const Numeric = (props: VariantProps) => <Type {...props} variant="numeric" />
Numeric.displayName = 'Type.Numeric'

const BrandedDisplay = (props: BrandedVariantProps) => (
  <BrandedType {...props} variant="display" />
)
BrandedDisplay.displayName = 'Type.Branded.Display'

const BrandedPageTitle = (props: BrandedVariantProps) => (
  <BrandedType {...props} variant="page-title" />
)
BrandedPageTitle.displayName = 'Type.Branded.PageTitle'

const BrandedHeading = (props: BrandedVariantProps) => (
  <BrandedType {...props} variant="heading" />
)
BrandedHeading.displayName = 'Type.Branded.Heading'

const BrandedLatin = (props: BrandedVariantProps) => (
  <BrandedType {...props} variant="latin" />
)
BrandedLatin.displayName = 'Type.Branded.Latin'

const Branded = {
  Display: BrandedDisplay,
  PageTitle: BrandedPageTitle,
  Heading: BrandedHeading,
  Latin: BrandedLatin,
}

export default Object.assign(Type, {
  Display,
  PageTitle,
  Heading,
  Subheading,
  SectionTitle,
  CardTitle,
  Body,
  BodySmall,
  Caption,
  SectionLabel,
  Numeric,
  Branded,
})
