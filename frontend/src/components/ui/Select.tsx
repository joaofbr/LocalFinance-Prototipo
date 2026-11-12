import type { SelectHTMLAttributes } from 'react'
import { Icon } from './Icon'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  compact?: boolean
  highlighted?: boolean
}

const BASE =
  'w-full min-w-0 cursor-pointer appearance-none truncate outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60'

const SIZING = {
  regular: 'h-[46px] rounded-xl border-[1.5px] pl-3.5 pr-10 text-[14px]',
  compact: 'h-[38px] rounded-[10px] border pl-3 pr-8 text-[13.5px] font-medium',
}

const TONE = {
  plain: 'border-border-strong bg-surface text-text hover:border-text-3',
  highlighted: 'border-primary bg-primary-weak text-primary-strong',
}

export function Select({
  compact = false,
  highlighted = false,
  className = '',
  children,
  ...rest
}: SelectProps) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <select
        className={`${BASE} ${SIZING[compact ? 'compact' : 'regular']} ${
          TONE[highlighted ? 'highlighted' : 'plain']
        }`}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevronDown"
        size={compact ? 15 : 17}
        strokeWidth={2.2}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
          compact ? 'right-2.5' : 'right-3.5'
        } ${highlighted ? 'text-primary-strong' : 'text-text-3'}`}
      />
    </div>
  )
}
