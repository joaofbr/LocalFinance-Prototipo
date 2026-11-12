import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney, formatSignedMoney, plural } from '@/lib/format'
import { MonthSelector } from '@/features/finance/components/MonthSelector'
import { FilterBar } from '@/features/finance/components/FilterBar'
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  matchesPayment,
  type TransactionFilters,
} from '@/features/finance/transactionFilters'
import { AssignCardSheet } from '@/features/cards/components/AssignCardSheet'
import { BillSummary } from '@/features/cards/components/BillSummary'
import { useCards } from '@/features/cards/hooks'
import { TransactionListItem } from '@/features/finance/components/TransactionListItem'
import { usePeriod } from '@/features/finance/PeriodContext'
import { useTransactionSheet } from '@/features/finance/TransactionSheetProvider'
import {
  useCategories,
  useHasFamily,
  useMembers,
  useMonthlyTransactions,
} from '@/features/finance/hooks'
import { getMonthlySummary } from '@/features/finance/selectors'
import {
  groupTransactions,
  shareOf,
} from '@/features/finance/transactionEntries'

export function TransactionsPage() {
  const { year, month, label } = usePeriod()
  const { openNew, openEdit, requestDelete } = useTransactionSheet()
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
  const [assigning, setAssigning] = useState(false)

  const transactionsQuery = useMonthlyTransactions(year, month)
  const categoriesQuery = useCategories()
  const membersQuery = useMembers()
  const cards = useCards().data ?? []
  const hasFamily = useHasFamily()

  const isLoading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    membersQuery.isLoading
  const isError = transactionsQuery.isError || categoriesQuery.isError
  const filtering = hasActiveFilters(filters)

  const categories = categoriesQuery.data ?? []
  const members = membersQuery.data ?? []
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const cardNameById = new Map(cards.map((c) => [c.id, c.name]))
  const activeCards = cards.filter((c) => c.active)

  const entries = groupTransactions(transactionsQuery.data ?? [])
  const cashExpenses = entries.filter(
    ({ transaction: t }) => t.type === 'expense' && !t.cardId,
  )

  const rows = entries
    .filter(({ transaction: t, memberIds }) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId)
        return false
      if (filters.memberId !== 'all' && !memberIds.includes(filters.memberId))
        return false
      return matchesPayment(t, filters.payment)
    })
    .map((entry) => ({
      entry,
      amount:
        filters.memberId === 'all'
          ? entry.total
          : shareOf(entry, filters.memberId),
    }))
  const summary = getMonthlySummary(
    rows.map(({ entry, amount }) => ({ type: entry.transaction.type, amount })),
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <MonthSelector />
        <Button className="hidden lg:flex" onClick={openNew} type="button">
          <Icon name="plus" size={18} />
          Novo lançamento
        </Button>
      </div>

      {cards.length > 0 && !isLoading && !isError && (
        <BillSummary
          cards={cards}
          entries={entries}
          period={{ year, month }}
          periodLabel={label}
          selectedCardId={filters.payment}
          canAssign={activeCards.length > 0 && cashExpenses.length > 0}
          onSelect={(payment) => setFilters({ ...filters, payment })}
          onAssign={() => setAssigning(true)}
        />
      )}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        members={members}
        cards={cards}
        showMembers={hasFamily}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {isError ? (
          <QueryError
            onRetry={() => {
              void transactionsQuery.refetch()
              void categoriesQuery.refetch()
            }}
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={52} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          filtering ? (
            <EmptyState
              icon="filter"
              title="Nada com esses filtros"
              text="Nenhum lançamento do mês combina com os filtros escolhidos."
            >
              <Button
                type="button"
                variant="secondary"
                className="mx-auto"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Limpar filtros
              </Button>
            </EmptyState>
          ) : (
            <EmptyState
              icon="list"
              title={`Nenhum lançamento em ${label.toLowerCase()}`}
              text="Registre uma receita ou despesa para começar a acompanhar o mês."
            >
              <Button type="button" className="mx-auto" onClick={openNew}>
                <Icon name="plus" size={18} />
                Novo lançamento
              </Button>
            </EmptyState>
          )
        ) : (
          <>
            <div className="flex flex-col">
              {rows.map(({ entry, amount }) => (
                <TransactionListItem
                  key={entry.key}
                  entry={entry}
                  amount={amount}
                  category={categoryById.get(entry.transaction.categoryId)}
                  participants={members.filter((m) =>
                    entry.memberIds.includes(m.id),
                  )}
                  showParticipants={hasFamily}
                  cardName={
                    entry.transaction.cardId
                      ? cardNameById.get(entry.transaction.cardId)
                      : undefined
                  }
                  onEdit={() => openEdit(entry)}
                  onDelete={() => requestDelete(entry.transaction)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 bg-surface-2 px-4 py-[15px]">
              <span className="text-[13px] font-semibold text-text-2">
                {plural(rows.length, 'lançamento', 'lançamentos')}
              </span>
              <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1 text-[13px]">
                <SummaryStat label="Receitas" value={summary.income} tone="income" />
                <SummaryStat label="Despesas" value={summary.expense} tone="expense" />
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

      {assigning && (
        <AssignCardSheet
          cards={activeCards}
          entries={cashExpenses}
          categories={categories}
          periodLabel={label}
          onClose={() => setAssigning(false)}
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

function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: IconName
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <div className="px-6 py-[54px] text-center">
      <div className="mx-auto mb-[18px] flex h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-surface-2 text-text-3">
        <Icon name={icon} size={30} strokeWidth={1.6} />
      </div>
      <div className="mb-1.5 text-[16px] font-bold">{title}</div>
      <p className="mx-auto mb-5 max-w-[300px] text-[14px] text-text-2">{text}</p>
      {children}
    </div>
  )
}
