import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { formatDateShort, formatMoney, plural } from '@/lib/format'
import type { TransactionEntry } from '@/features/finance/transactionEntries'
import type { Category } from '@/features/finance/types'
import { useAssignCard } from '../hooks'
import type { Card } from '../types'

interface AssignCardSheetProps {
  cards: Card[]
  entries: TransactionEntry[]
  categories: Category[]
  periodLabel: string
  onClose: () => void
}

export function AssignCardSheet({
  cards,
  entries,
  categories,
  periodLabel,
  onClose,
}: AssignCardSheetProps) {
  const { showToast } = useToast()
  const assignCard = useAssignCard()
  const [cardId, setCardId] = useState(cards[0]?.id ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const allSelected = entries.length > 0 && selected.size === entries.length
  const card = cards.find((c) => c.id === cardId)

  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(entries.map((entry) => entry.key)))

  const submit = () => {
    if (!card || selected.size === 0) return
    const transactionIds = entries
      .filter((entry) => selected.has(entry.key))
      .flatMap((entry) => entry.parts.map((part) => part.id))
    assignCard.mutate(
      { cardId: card.id, transactionIds },
      {
        onSuccess: () => {
          showToast(
            `${plural(selected.size, 'lançamento atribuído', 'lançamentos atribuídos')} ao ${card.name}`,
          )
          onClose()
        },
        onError: (error) =>
          showToast(
            getApiErrorMessage(error, 'Não foi possível atribuir ao cartão'),
            'warning',
          ),
      },
    )
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-[460px] flex-col rounded-t-[26px] bg-surface shadow-card-lg sm:rounded-[26px]"
      >
        <div className="flex items-center justify-between border-b border-border px-5 pb-3 pt-[18px]">
          <h3 className="text-[17px] font-extrabold tracking-tight">Atribuir a um cartão</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-2"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
          <p className="mb-4 text-[13px] leading-relaxed text-text-2">
            Marque as compras que foram feitas no cartão. Elas continuam em{' '}
            {periodLabel.toLowerCase()} e passam a contar na fatura dele.
          </p>

          <label htmlFor="assign-card" className="mb-1.5 block text-[13px] font-semibold text-text-2">
            Cartão
          </label>
          <select
            id="assign-card"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="mb-4 w-full cursor-pointer rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14px] text-text outline-none focus:border-primary"
          >
            {cards.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <div className="mb-1 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-text-2">
              Despesas sem cartão
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="rounded-lg px-2 py-1 text-[13px] font-semibold text-primary hover:bg-surface-2"
            >
              {allSelected ? 'Desmarcar todas' : 'Marcar todas'}
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            {entries.map((entry) => {
              const { transaction } = entry
              return (
                <label
                  key={entry.key}
                  className="flex cursor-pointer items-center gap-3 border-b border-border px-3.5 py-3 last:border-b-0 hover:bg-surface-2/60"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(entry.key)}
                    onChange={() => toggle(entry.key)}
                    className="h-[18px] w-[18px] flex-shrink-0 accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">
                      {transaction.description}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-text-3">
                      {categoryName.get(transaction.categoryId) ?? '—'} ·{' '}
                      {formatDateShort(transaction.date)}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-[14px] font-semibold tabular-nums text-expense">
                    − {formatMoney(entry.total)}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2.5 border-t border-border px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border-strong py-3.5 text-[14.5px] font-semibold text-text"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={selected.size === 0 || !card || assignCard.isPending}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg shadow-card-md disabled:opacity-60"
          >
            {assignCard.isPending && (
              <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
            )}
            {selected.size > 0 ? `Atribuir ${selected.size}` : 'Atribuir'}
          </button>
        </div>
      </div>
    </div>
  )
}
