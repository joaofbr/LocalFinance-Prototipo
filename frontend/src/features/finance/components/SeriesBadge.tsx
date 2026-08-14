import { Icon } from '@/components/ui/Icon'
import type { Transaction } from '../types'

interface SeriesBadgeProps {
  transaction: Pick<Transaction, 'seriesKind' | 'seriesIndex' | 'seriesTotal'>
}

export function SeriesBadge({ transaction }: SeriesBadgeProps) {
  const { seriesKind, seriesIndex, seriesTotal } = transaction
  if (!seriesKind || !seriesIndex || !seriesTotal) return null

  if (seriesKind === 'fixed') {
    return (
      <span
        title={`Gasto fixo, mês ${seriesIndex} de ${seriesTotal}`}
        className="flex flex-shrink-0 items-center gap-0.5 rounded-full bg-surface-2 px-1.5 py-[1px] text-[10.5px] font-bold text-text-2"
      >
        <Icon name="calendar" size={10} />
        Fixo
      </span>
    )
  }

  return (
    <span
      title={`Parcela ${seriesIndex} de ${seriesTotal}`}
      className="flex-shrink-0 rounded-full bg-surface-2 px-1.5 py-[1px] text-[10.5px] font-bold tabular-nums text-text-2"
    >
      {seriesIndex}/{seriesTotal}
    </span>
  )
}
