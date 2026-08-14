import type { Transaction } from '../types'

interface InstallmentBadgeProps {
  transaction: Pick<Transaction, 'installmentNumber' | 'installmentTotal'>
}

export function InstallmentBadge({ transaction }: InstallmentBadgeProps) {
  const { installmentNumber, installmentTotal } = transaction
  if (!installmentNumber || !installmentTotal) return null

  return (
    <span
      title={`Parcela ${installmentNumber} de ${installmentTotal}`}
      className="flex-shrink-0 rounded-full bg-surface-2 px-1.5 py-[1px] text-[10.5px] font-bold tabular-nums text-text-2"
    >
      {installmentNumber}/{installmentTotal}
    </span>
  )
}
