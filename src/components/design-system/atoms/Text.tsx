import type { ElementType, HTMLAttributes, ReactNode } from 'react'

/**
 * Variant defines the typographic role.
 * - `display`        — h1 hero title for landing/detail pages.
 * - `page-title`     — h1 standard page header.
 * - `heading`        — mid-tier section heading (h2).
 * - `subheading`     — minor heading (h3).
 * - `section-title`  — content-section heading inside a card or panel.
 * - `section-label`  — uppercase eyebrow / form label.
 * - `card-title`     — title inside a card or grid tile.
 */
export type TextVariant =
  | 'display'
  | 'page-title'
  | 'heading'
  | 'subheading'
  | 'section-title'
  | 'section-label'
  | 'card-title'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  /** Override the semantic element. Each variant has a sensible default. */
  as?: ElementType
  className?: string
  children?: ReactNode
}

type VariantTextProps = Omit<TextProps, 'variant'>

const variantClass: Record<TextVariant, string> = {
  display: 'text-3xl font-display font-bold text-earth-100 tracking-tight',
  'page-title': 'text-xl font-display font-bold text-earth-100 tracking-wide',
  heading: 'text-2xl font-display font-bold text-earth-100 tracking-wide',
  subheading: 'text-lg font-display font-semibold text-earth-100',
  'section-title': 'section-title',
  'section-label': 'section-subtitle',
  'card-title': 'text-sm font-display font-semibold text-earth-100',
}

const variantElement: Record<TextVariant, ElementType> = {
  display: 'h1',
  'page-title': 'h1',
  heading: 'h2',
  subheading: 'h3',
  'section-title': 'h2',
  'section-label': 'div',
  'card-title': 'h3',
}

/**
 * Standard typography atom for the 14 HEC design system.
 *
 * Prefer the variant subcomponents at call sites:
 *   `<Text.Display>`, `<Text.PageTitle>`, `<Text.Heading>`, `<Text.Subheading>`,
 *   `<Text.SectionTitle>`, `<Text.SectionLabel>`, `<Text.CardTitle>`.
 *
 * Override the semantic element with `as` when the visual role and the heading
 * level diverge (e.g. a section-title rendered as `h3` inside a nested panel).
 *
 * Compose with `className` for tone overrides (`text-botanical-400`,
 * `text-gradient-gold`, `text-red-300`) — same escape hatch as `Button`.
 *
 * @example
 * <Text.PageTitle>Plants</Text.PageTitle>
 * <Text.Display className="text-gradient-botanical">14 HEC Plant Intelligence</Text.Display>
 * <Text.SectionTitle>Plant Recommendations</Text.SectionTitle>
 * <Text.SectionTitle as="h3" className="text-red-300">Plants to Avoid</Text.SectionTitle>
 * <Text.SectionLabel as="label">Ailment / Condition</Text.SectionLabel>
 * <Text.CardTitle className="text-botanical-400">{plant.common_name}</Text.CardTitle>
 */
function Text({
  variant = 'page-title',
  as,
  className,
  children,
  ...rest
}: TextProps) {
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

const Display = (props: VariantTextProps) => <Text {...props} variant="display" />
Display.displayName = 'Text.Display'

const PageTitle = (props: VariantTextProps) => <Text {...props} variant="page-title" />
PageTitle.displayName = 'Text.PageTitle'

const Heading = (props: VariantTextProps) => <Text {...props} variant="heading" />
Heading.displayName = 'Text.Heading'

const Subheading = (props: VariantTextProps) => <Text {...props} variant="subheading" />
Subheading.displayName = 'Text.Subheading'

const SectionTitle = (props: VariantTextProps) => <Text {...props} variant="section-title" />
SectionTitle.displayName = 'Text.SectionTitle'

const SectionLabel = (props: VariantTextProps) => <Text {...props} variant="section-label" />
SectionLabel.displayName = 'Text.SectionLabel'

const CardTitle = (props: VariantTextProps) => <Text {...props} variant="card-title" />
CardTitle.displayName = 'Text.CardTitle'

export default Object.assign(Text, {
  Display,
  PageTitle,
  Heading,
  Subheading,
  SectionTitle,
  SectionLabel,
  CardTitle,
})
