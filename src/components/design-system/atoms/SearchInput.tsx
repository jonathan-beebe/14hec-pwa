import { forwardRef, type InputHTMLAttributes } from 'react'

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
>

export interface SearchInputProps extends NativeInputProps {
  value: string
  onChange: (value: string) => void
  /** Hide the leading search icon. Default `false`. */
  hideIcon?: boolean
}

const inputClass =
  'w-full rounded-xl bg-earth-900/50 backdrop-blur-md border border-white/[0.08] ' +
  'pl-10 pr-4 py-2.5 text-sm text-earth-100 placeholder-earth-500 ' +
  'focus:outline-none focus:border-botanical-500/40 ' +
  'focus:ring-[3px] focus:ring-botanical-500/10 ' +
  'transition-all duration-200'

const inputClassNoIcon = inputClass.replace('pl-10 ', 'px-4 ')

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange, hideIcon = false, className, ...rest }, ref) {
    const composedClass = (hideIcon ? inputClassNoIcon : inputClass) +
      (className ? ` ${className}` : '')

    return (
      <div className="relative w-full">
        {!hideIcon && (
          <span
            data-search-icon
            aria-hidden="true"
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-earth-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        )}
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={composedClass}
          {...rest}
        />
      </div>
    )
  },
)

export default SearchInput
