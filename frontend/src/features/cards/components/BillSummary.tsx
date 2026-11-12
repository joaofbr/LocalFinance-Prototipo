import { Icon } from '@/components/ui/Icon'
import { formatMoney } from '@/lib/format'
import type { TransactionEntry } from '@/features/finance/transactionEntries'
import { billDates } from '../billing'
import type { Month } from '../billing'
import type { Card } from '../types'

interface BillSummaryProps {
  cards: Card[]
  entries: TransactionEntry[]
  period: Month
  periodLabel: string
  selectedCardId: string
  canAssign: boolean
  onSelect: (cardId: string) => void
  onAssign: () => void
}

export function BillSummary({
  cards,
  entries,
  period,
  periodLabel,
  selectedCardId,
  canAssign,
  onSelect,
  onAssign,
}: BillSummaryProps) {
  const bills = cards
    .map((card) => ({
      card,
      total: entries
        .filter(({ transaction: t }) => t.type === 'expense' && t.cardId === card.id)
        .reduce((sum, entry) => sum + entry.total, 0),
    }))
    .filter((bill) => bill.total > 0)

  return (
    <section className="mb-3.5">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-[13px] font-semibold text-text-2">
          Faturas de {periodLabel.toLowerCase()}
        </h2>
        {canAssign && (
          <button
            type="button"
            onClick={onAssign}
            className="ml-auto rounded-lg px-2 py-1 text-[13px] font-semibold text-primary hover:bg-surface-2"
          >
            Atribuir a um cartão
          </button>
        )}
      </div>

      {bills.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-strong px-4 py-3.5 text-[13px] text-text-3">
          Nenhuma compra no cartão com fatura neste mês.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {bills.map(({ card, total }) => {
            const selected = selectedCardId === card.id
            const { closing, due } = billDates(card, period)
            return (
              <button
                key={card.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(selected ? 'all' : card.id)}
                className={`flex items-center gap-3 rounded-2xl border bg-surface px-3.5 py-3 text-left shadow-card transition-colors hover:bg-surface-2/60 ${
                  selected ? 'border-primary' : 'border-border'
                }`}
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text-2">
                  <Icon name="creditCard" size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{card.name}</span>
                  <span className="mt-0.5 block truncate text-[12px] text-text-3">
                    Fecha {closing} · vence {due}
                  </span>
                </span>
                <span className="whitespace-nowrap text-[15px] font-bold text-expense">
                  {formatMoney(total)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
