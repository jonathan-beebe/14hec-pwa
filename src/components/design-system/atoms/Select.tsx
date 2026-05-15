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
  /** Stretch the control to fill its container width. */
  fullWidth?: boolean
}

// Native <select> arrows differ across browsers and engines and are
// drawn flush to the padding edge. We hide the native arrow and draw a
// chevron from a design-system token so the arrow has consistent spacing
// and matches the dark theme. Focus/hover treatment mirrors SearchInput
// so the two controls feel like one family.
const selectClass =
  'appearance-none rounded-xl bg-earth-900/50 backdrop-blur-md ' +
  'border border-white/[0.08] hover:border-white/[0.14] ' +
  'pl-3 pr-9 py-2.5 text-sm text-earth-300 cursor-pointer ' +
  'focus:outline-none ' +
  'focus-visible:border-botanical-400 ' +
  'focus-visible:ring-2 focus-visible:ring-botanical-400/40 ' +
  'transition-colors duration-150'

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, options, value, onChange, fullWidth, className, ...rest }, ref) {
    const composedClass = selectClass + (fullWidth ? ' w-full' : '') + (className ? ` ${className}` : '')
    return (
      <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
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
        <span
          data-select-chevron
          aria-hidden="true"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-500"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
    )
  },
)

export default Select
