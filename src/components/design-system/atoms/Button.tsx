import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Variant defines the button's visual treatment.
 * - `primary`   — principal action; gradient green, glowing.
 * - `celestial` — astrology surfaces; gradient purple, glowing.
 * - `ghost`     — low-emphasis or tertiary action; text only with subtle hover.
 */
export type ButtonVariant = 'primary' | 'celestial' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /**
   * Internal SPA route to navigate to on click. Ignored if `onClick` is provided.
   */
  route?: string
}

type VariantButtonProps = Omit<ButtonProps, 'variant'>

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  celestial: 'btn-celestial',
  ghost: 'btn-ghost',
}

/**
 * Standard button atom for the 14 HEC design system.
 *
 * Prefer the variant subcomponents at call sites:
 *   `<Button.Primary>`, `<Button.Celestial>`, `<Button.Ghost>`.
 *
 * Use the `variant` prop directly only when the variant is dynamic.
 *
 * Pass `route` for pure SPA navigation, or `onClick` for any other behavior.
 * `onClick` wins if both are set. Forwards all native `<button>` props.
 *
 * @example
 * // Compound subcomponents (preferred)
 * <Button.Primary onClick={save}>Save</Button.Primary>
 * <Button.Ghost route="/ailments">← Back</Button.Ghost>
 * <Button.Celestial onClick={openChart}>Open chart</Button.Celestial>
 *
 * @example
 * // Variant prop (for dynamic variants)
 * <Button variant={isAstro ? 'celestial' : 'primary'}>Open</Button>
 */
function Button({
  variant = 'primary',
  className,
  type = 'button',
  route,
  onClick,
  ...rest
}: ButtonProps) {
  const navigate = useNavigate()
  const classes = className
    ? `${variantClass[variant]} ${className}`
    : variantClass[variant]

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
      return
    }
    if (route) navigate(route)
  }

  return (
    <button type={type} className={classes} onClick={handleClick} {...rest} />
  )
}

const Primary = (props: VariantButtonProps) => <Button {...props} variant="primary" />
Primary.displayName = 'Button.Primary'

const Celestial = (props: VariantButtonProps) => <Button {...props} variant="celestial" />
Celestial.displayName = 'Button.Celestial'

const Ghost = (props: VariantButtonProps) => <Button {...props} variant="ghost" />
Ghost.displayName = 'Button.Ghost'

export default Object.assign(Button, { Primary, Celestial, Ghost })
