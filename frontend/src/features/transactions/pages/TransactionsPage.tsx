import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastProvider'
import { formatMoney, formatSignedMoney } from '@/lib/format'
import { MonthSelector } from '@/features/finance/components/MonthSelector'
import { FilterBar } from '@/features/finance/components/FilterBar'
import {
  DEFAULT_FILTERS,
  type TransactionFilters,
} from '@/features/finance/transactionFilters'
import { TransactionListItem } from '@/features/finance/components/TransactionListItem'
import { SeriesScopeDialog } from '@/features/finance/components/SeriesScopeDialog'
import type {
  Transaction,
  TransactionScope,
} from '@/features/finance/types'
import { usePeriod } from '@/features/finance/PeriodContext'
import { useTransactionSheet } from '@/features/finance/TransactionSheetProvider'
import {
  useCategories,
  useDeleteTransaction,
  useMembers,
  useMonthlyTransactions,
} from '@/features/finance/hooks'
import { getMonthlySummary } from '@/features/finance/selectors'

const DELETE_MESSAGE: Record<TransactionScope, string> = {
  one: 'Lançamento excluído',
  future: 'Lançamentos futuros excluídos',
  all: 'Série excluída',
}

export function TransactionsPage() {
  const { year, month } = usePeriod()
  const { openNew, openEdit } = useTransactionSheet()
  const { showToast } = useToast()
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
  const [confirmingDelete, setConfirmingDelete] = useState<Transaction | null>(
    null,
  )

  const transactionsQuery = useMonthlyTransactions(year, month)
  const categoriesQuery = useCategories()
  const membersQuery = useMembers()
  const deleteMutation = useDeleteTransaction()

  const isLoading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    membersQuery.isLoading

  const categories = categoriesQuery.data ?? []
  const members = membersQuery.data ?? []
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const memberById = new Map(members.map((m) => [m.id, m]))

  const filtered = (transactionsQuery.data ?? []).filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false
    if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId)
      return false
    if (filters.memberId !== 'all' && t.memberId !== filters.memberId)
      return false
    return true
  })
  const summary = getMonthlySummary(filtered)

  const removeTransaction = (id: string, scope: TransactionScope) => {
    deleteMutation.mutate(
      { id, scope },
      {
        onSuccess: () => {
          setConfirmingDelete(null)
          showToast(DELETE_MESSAGE[scope], 'neutral')
        },
      },
    )
  }

  const handleDelete = (transaction: Transaction) => {
    if ((transaction.seriesTotal ?? 1) > 1) {
      setConfirmingDelete(transaction)
      return
    }
    removeTransaction(transaction.id, 'one')
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <MonthSelector />
        <Button className="hidden lg:flex" onClick={openNew} type="button">
          <Icon name="plus" size={18} />
          Novo lançamento
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        members={members}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={52} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onNew={openNew} />
        ) : (
          <>
            <div className="flex flex-col">
              {filtered.map((transaction) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  category={categoryById.get(transaction.categoryId)}
                  member={memberById.get(transaction.memberId)}
                  onEdit={() => openEdit(transaction)}
                  onDelete={() => handleDelete(transaction)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3.5 bg-surface-2 px-4 py-[15px]">
              <span className="text-[13px] font-semibold text-text-2">
                {filtered.length} lançamento(s)
              </span>
              <div className="flex items-center gap-[18px] text-[13px]">
                <SummaryStat label="Receitas" value={summary.income} tone="income" />
                <SummaryStat
                  label="Despesas"
                  value={summary.expense}
                  tone="expense"
                />
                <SummaryStat
                  label="Saldo"
                  value={summary.balance}
                  tone={summary.balance >= 0 ? 'income' : 'expense'}
                  signed
                />
              </div>
            </div>
          </>
        )}
      </div>

      {confirmingDelete && (
        <SeriesScopeDialog
          transaction={confirmingDelete}
          action="delete"
          busy={deleteMutation.isPending}
          onChoose={(scope) => removeTransaction(confirmingDelete.id, scope)}
          onCancel={() => setConfirmingDelete(null)}
        />
      )}
    </div>
  )
}

function SummaryStat({
  label,
  value,
  tone,
  signed = false,
}: {
  label: string
  value: number
  tone: 'income' | 'expense'
  signed?: boolean
}) {
  return (
    <span className="text-text-2">
      {label}{' '}
      <strong
        className={`tabular-nums ${tone === 'income' ? 'text-income' : 'text-expense'}`}
      >
        {signed ? formatSignedMoney(value) : formatMoney(value)}
      </strong>
    </span>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="px-6 py-[54px] text-center">
      <div className="mx-auto mb-[18px] flex h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-surface-2 text-text-3">
        <Icon name="search" size={30} strokeWidth={1.6} />
      </div>
      <div className="mb-1.5 text-[16px] font-bold">
        Nenhum lançamento encontrado
      </div>
      <p className="mx-auto mb-5 max-w-[300px] text-[14px] text-text-2">
        Ajuste os filtros do período ou registre uma nova transação para começar.
      </p>
      <Button onClick={onNew} type="button" className="mx-auto">
        <Icon name="plus" size={18} />
        Novo lançamento
      </Button>
    </div>
  )
}
