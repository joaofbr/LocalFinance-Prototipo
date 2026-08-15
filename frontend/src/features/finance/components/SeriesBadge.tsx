import { Icon } from '@/components/ui/Icon'
import type { Transaction } from '../types'

interface SeriesBadgeProps {
  transaction: Pick<
    Transaction,
    'seriesKind' | 'seriesIndex' | 'seriesTotal' | 'splitTotal'
  >
}

const PILL =
  'flex flex-shrink-0 items-center gap-0.5 rounded-full bg-surface-2 px-1.5 py-[1px] text-[10.5px] font-bold text-text-2'

export function SeriesBadge({ transaction }: SeriesBadgeProps) {
  const { seriesKind, seriesIndex, seriesTotal, splitTotal } = transaction
  const shared = (splitTotal ?? 0) > 1
  const repeated = Boolean(seriesKind && seriesIndex && seriesTotal)

  if (!shared && !repeated) return null

  return (
    <>
      {shared && (
        <span title={`Dividido entre ${splitTotal} integrantes`} className={PILL}>
          <Icon name="users" size={10} />
          Conjunto
        </span>
      )}
      {repeated &&
        (seriesKind === 'fixed' ? (
          <span
            title={`Gasto fixo, mês ${seriesIndex} de ${seriesTotal}`}
            className={PILL}
          >
            <Icon name="calendar" size={10} />
            Fixo
          </span>
        ) : (
          <span
            title={`Parcela ${seriesIndex} de ${seriesTotal}`}
            className={`${PILL} tabular-nums`}
          >
            {seriesIndex}/{seriesTotal}
          </span>
        ))}
    </>
  )
}
