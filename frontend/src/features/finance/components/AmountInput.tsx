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
    <div>
      <div className="mb-1.5 text-center text-[13px] font-semibold text-text-2">
        Valor
      </div>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-[26px] font-bold" style={{ color }}>
          {type === 'income' ? '+' : '-'}
        </span>
        <span className="text-[16px] font-semibold text-text-3">R$</span>
        <input
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(parseDigitsToCents(e.target.value))}
          size={Math.max(display.length, 4)}
          aria-label="Valor"
          className="bg-transparent text-center text-[42px] font-extrabold tracking-tight tabular-nums outline-none"
          style={{ color }}
        />
      </div>
    </div>
  )
}
