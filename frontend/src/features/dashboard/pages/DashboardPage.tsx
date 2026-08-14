import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney, formatSignedMoney } from '@/lib/format'
import { MonthSelector } from '@/features/finance/components/MonthSelector'
import { StatCard } from '@/features/finance/components/StatCard'
import { DonutChart } from '@/features/finance/components/DonutChart'
import { RecentTransactions } from '@/features/finance/components/RecentTransactions'
import { usePeriod } from '@/features/finance/PeriodContext'
import { useTransactionSheet } from '@/features/finance/TransactionSheetProvider'
import { useCategories, useMonthlyTransactions } from '@/features/finance/hooks'
import { getDonut, getMonthlySummary } from '@/features/finance/selectors'

export function DashboardPage() {
  const { openNew } = useTransactionSheet()
  const { year, month } = usePeriod()
  const transactionsQuery = useMonthlyTransactions(year, month)
  const categoriesQuery = useCategories()

  const isLoading = transactionsQuery.isLoading || categoriesQuery.isLoading
  const transactions = transactionsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  const summary = getMonthlySummary(transactions)
  const donut = getDonut(transactions, categories)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <MonthSelector />
        <Button className="hidden lg:flex" onClick={openNew} type="button">
          <Icon name="plus" size={18} />
          Novo lançamento
        </Button>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="mb-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Receitas"
              value={formatMoney(summary.income)}
              icon="arrowUp"
              tone="income"
            />
            <StatCard
              label="Despesas"
              value={formatMoney(summary.expense)}
              icon="arrowDown"
              tone="expense"
            />
            <StatCard
              label="Saldo do mês"
              value={formatSignedMoney(summary.balance)}
              icon="wallet2"
              tone="neutral"
              valueColor={
                summary.balance >= 0 ? 'var(--income)' : 'var(--expense)'
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <div className="mb-[18px] text-[15px] font-bold">
                Gastos por categoria
              </div>
              {donut.total > 0 ? (
                <DonutChart
                  segments={donut.segments}
                  legend={donut.legend}
                  total={donut.total}
                />
              ) : (
                <p className="py-8 text-center text-[14px] text-text-2">
                  Sem despesas registradas neste mês.
                </p>
              )}
            </div>

            <RecentTransactions
              transactions={transactions}
              categories={categories}
            />
          </div>
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton height={118} />
        <Skeleton height={118} />
        <Skeleton height={118} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Skeleton height={280} />
        <Skeleton height={280} />
      </div>
    </>
  )
}
