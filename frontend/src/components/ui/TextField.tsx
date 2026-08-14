import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  leadingIcon?: IconName
  error?: string
  passwordToggle?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, leadingIcon, error, passwordToggle, type = 'text', className = '', ...rest },
    ref,
  ) {
    const [revealed, setRevealed] = useState(false)
    const resolvedType = passwordToggle ? (revealed ? 'text' : 'password') : type

    return (
      <div className="mb-[18px]">
        <label className="mb-[7px] block text-[13px] font-semibold text-text-2">
          {label}
        </label>
        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-[13px] top-1/2 flex -translate-y-1/2 text-text-3">
              <Icon name={leadingIcon} size={18} />
            </div>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={`w-full rounded-xl border-[1.5px] bg-surface text-[15px] text-text outline-none transition-colors focus:border-primary ${
              leadingIcon ? 'pl-[42px]' : 'pl-[14px]'
            } ${passwordToggle ? 'pr-[44px]' : 'pr-[14px]'} py-[13px] ${
              error ? 'border-expense' : 'border-border-strong'
            } ${className}`}
            aria-invalid={error ? true : undefined}
            {...rest}
          />
          {passwordToggle && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-text-3"
              aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Icon name={revealed ? 'eyeOff' : 'eye'} size={18} />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[12.5px] font-medium text-expense">{error}</p>
        )}
      </div>
    )
  },
)
