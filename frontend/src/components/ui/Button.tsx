import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  loadingLabel?: string
  fullWidth?: boolean
  children: ReactNode
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-fg shadow-card-md hover:opacity-95 disabled:opacity-60',
  secondary:
    'bg-surface text-text border border-border-strong hover:bg-surface-2 disabled:opacity-60',
  ghost: 'bg-transparent text-text-2 hover:bg-surface-2 disabled:opacity-60',
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingLabel,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3.5 text-[15.5px] font-bold transition-opacity disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="inline-block h-[18px] w-[18px] flex-shrink-0 animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
      )}
      {loading ? <span>{loadingLabel ?? children}</span> : children}
    </button>
  )
}
