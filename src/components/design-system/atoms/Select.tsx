import { forwardRef, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

type NativeSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange'
>

export interface SelectProps extends NativeSelectProps {
  /** Accessible name. Drives `aria-label`; not rendered as visible text. */
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

const selectClass =
  'rounded-xl bg-earth-900/50 backdrop-blur-md border border-white/[0.08] ' +
  'px-3 py-2.5 text-sm text-earth-300 cursor-pointer ' +
  'focus:outline-none focus:border-botanical-500/40 ' +
  'focus:ring-[3px] focus:ring-botanical-500/10 ' +
  'transition-all duration-200'

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, options, value, onChange, className, ...rest }, ref) {
    const composedClass = selectClass + (className ? ` ${className}` : '')
    return (
      <select
        ref={ref}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={composedClass}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  },
)

export default Select
