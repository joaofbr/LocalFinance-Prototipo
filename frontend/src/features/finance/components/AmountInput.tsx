import { formatCents, parseDigitsToCents } from '@/lib/format'
import type { TransactionType } from '../types'

interface AmountInputProps {
  type: TransactionType
  cents: number
  onChange: (cents: number) => void
}

export function AmountInput({ type, cents, onChange }: AmountInputProps) {
  const color = type === 'income' ? 'var(--income)' : 'var(--expense)'
  const display = formatCents(cents)

  return (
    <label className="block">
      <span className="mb-1 block text-center text-[13px] font-semibold text-text-2">
        Valor
      </span>
      <span className="flex items-baseline justify-center gap-1.5" style={{ color }}>
        <span className="text-[22px] font-bold">
          {type === 'income' ? '+' : '−'}
        </span>
        <span className="text-[18px] font-semibold opacity-70">R$</span>
        <input
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(parseDigitsToCents(e.target.value))}
          onFocus={(e) => e.target.select()}
          aria-label="Valor"
          className="min-w-0 bg-transparent text-[42px] font-extrabold tracking-tight outline-none"
          style={{ width: `${Math.max(display.length, 4) - 0.4}ch`, color }}
        />
      </span>
    </label>
  )
}
