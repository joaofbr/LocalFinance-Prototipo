import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney, formatMonthShort, formatPeriodLabel } from '@/lib/format'
import { MonthSelector } from '@/features/finance/components/MonthSelector'
import { MonthSummaryCards } from '@/features/finance/components/MonthSummaryCards'
import { usePeriod } from '@/features/finance/PeriodContext'
import {
  useCategories,
  useHasFamily,
  useMembers,
  useMonthlyTransactions,
  useMonthlyTrend,
} from '@/features/finance/hooks'
import {
  getCategoryReport,
  getMemberReport,
  getMonthlySummary,
} from '@/features/finance/selectors'
import type { MonthlyTrendPoint } from '@/features/finance/types'

type ReportTab = 'summary' | 'category' | 'member'

const TABS: { value: ReportTab; label: string }[] = [
  { value: 'summary', label: 'Resumo mensal' },
  { value: 'category', label: 'Por categoria' },
  { value: 'member', label: 'Por integrante' },
]

export function ReportsPage() {
  const { year, month } = usePeriod()
  const [tab, setTab] = useState<ReportTab>('summary')

  const transactionsQuery = useMonthlyTransactions(year, month)
  const categoriesQuery = useCategories()
  const membersQuery = useMembers()
  const trendQuery = useMonthlyTrend(year, month)

  const isLoading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    membersQuery.isLoading ||
    trendQuery.isLoading
  const isError =
    transactionsQuery.isError || categoriesQuery.isError || trendQuery.isError

  const transactions = transactionsQuery.data ?? []
  const hasFamily = useHasFamily()
  const tabs = TABS.filter((option) => hasFamily || option.value !== 'member')
  const summary = getMonthlySummary(transactions)
  const categoryReport = getCategoryReport(
    transactions,
    categoriesQuery.data ?? [],
  )
  const memberReport = getMemberReport(transactions, membersQuery.data ?? [])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <MonthSelector />
      </div>

      <div className="mb-4 flex max-w-[480px] gap-1 rounded-[13px] bg-surface-2 p-[5px]">
        {tabs.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`flex-1 rounded-[9px] py-[9px] text-[13.5px] ${
              tab === option.value
                ? 'bg-surface font-semibold text-text shadow-card'
                : 'font-medium text-text-2'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="rounded-[20px] border border-border bg-surface shadow-card">
          <QueryError
            onRetry={() => {
              void transactionsQuery.refetch()
              void categoriesQuery.refetch()
              void trendQuery.refetch()
            }}
          />
        </div>
      ) : isLoading ? (
        <ReportsSkeleton />
      ) : tab === 'summary' ? (
        <>
          <div className="mb-4">
            <MonthSummaryCards summary={summary} />
          </div>
          <TrendChart key={`${year}-${month}`} points={trendQuery.data ?? []} />
        </>
      ) : tab === 'category' ? (
        <ReportCard title="Despesas por categoria" total={categoryReport.total}>
          {categoryReport.entries.length === 0 ? (
            <EmptyReport />
          ) : (
            categoryReport.entries.map((entry) => (
              <ReportBarRow
                key={entry.category.id}
                leading={
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
                    style={{ background: entry.category.color }}
                  />
                }
                name={entry.category.name}
                amount={entry.amount}
                percent={entry.percent}
                color={entry.category.color}
              />
            ))
          )}
        </ReportCard>
      ) : (
        <ReportCard title="Despesas por integrante" total={memberReport.total}>
          {memberReport.entries.length === 0 ? (
            <EmptyReport />
          ) : (
            memberReport.entries.map((entry) => (
              <ReportBarRow
                key={entry.member.id}
                leading={
                  <Avatar
                    name={entry.member.name}
                    color={entry.member.color}
                    size={30}
                  />
                }
                name={entry.member.name}
                amount={entry.amount}
                percent={entry.percent}
                color={entry.member.color}
              />
            ))
          )}
        </ReportCard>
      )}
    </div>
  )
}

function TrendChart({ points }: { points: MonthlyTrendPoint[] }) {
  const [selected, setSelected] = useState(points.length - 1)
  const max = Math.max(...points.map((p) => Math.max(p.income, p.expense)), 0)
  const barHeight = (value: number) => (max ? (value / max) * 120 : 0)
  const current = points[selected]

  return (
    <div className="rounded-[20px] border border-border bg-surface p-5 shadow-card sm:p-[22px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="text-[15px] font-bold">Evolução dos últimos 6 meses</div>
        <div className="flex items-center gap-4 text-[12.5px] text-text-2">
          <span className="flex items-center gap-1.5">
            <span className="h-[10px] w-[10px] rounded-[3px] bg-chart-income" />
            Receitas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[10px] w-[10px] rounded-[3px] bg-chart-expense" />
            Despesas
          </span>
        </div>
      </div>

      {current && (
        <div className="mb-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-xl bg-surface-2 px-3.5 py-2.5 text-[13px] text-text-2">
          <span className="font-semibold text-text">
            {formatPeriodLabel(current.year, current.month)}
          </span>
          <span>
            Receitas{' '}
            <strong className="tabular-nums text-text">
              {formatMoney(current.income)}
            </strong>
          </span>
          <span>
            Despesas{' '}
            <strong className="tabular-nums text-text">
              {formatMoney(current.expense)}
            </strong>
          </span>
        </div>
      )}

      <div className="flex items-end justify-between gap-1 border-b border-border">
        {points.map((point, index) => (
          <button
            key={`${point.year}-${point.month}`}
            type="button"
            onClick={() => setSelected(index)}
            onMouseEnter={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            aria-pressed={index === selected}
            aria-label={`${formatPeriodLabel(point.year, point.month)}: receitas ${formatMoney(point.income)}, despesas ${formatMoney(point.expense)}`}
            className={`flex h-[136px] flex-1 items-end justify-center gap-[3px] rounded-t-lg pt-2 transition-colors ${
              index === selected ? 'bg-surface-2' : 'hover:bg-surface-2/60'
            }`}
          >
            <span
              className="w-[11px] rounded-t-[4px] bg-chart-income"
              style={{ height: barHeight(point.income) }}
            />
            <span
              className="w-[11px] rounded-t-[4px] bg-chart-expense"
              style={{ height: barHeight(point.expense) }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-1">
        {points.map((point, index) => (
          <span
            key={`${point.year}-${point.month}`}
            className={`flex-1 text-center text-[12px] font-semibold ${
              index === selected ? 'text-text' : 'text-text-3'
            }`}
          >
            {formatMonthShort(point.month)}
          </span>
        ))}
      </div>
    </div>
  )
}

function ReportCard({
  title,
  total,
  children,
}: {
  title: string
  total: number
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-5 shadow-card">
      <div className="mb-[18px] flex items-center justify-between">
        <div className="text-[15px] font-bold">{title}</div>
        <div className="text-[13px] text-text-2">
          Total{' '}
          <strong className="tabular-nums text-text">
            {formatMoney(total)}
          </strong>
        </div>
      </div>
      <div className="flex flex-col gap-[15px]">{children}</div>
    </div>
  )
}

function ReportBarRow({
  leading,
  name,
  amount,
  percent,
  color,
}: {
  leading: React.ReactNode
  name: string
  amount: number
  percent: number
  color: string
}) {
  return (
    <div>
      <div className="mb-[7px] flex items-center gap-2.5">
        {leading}
        <span className="flex-1 text-[14px] font-semibold">{name}</span>
        <span className="mr-2.5 text-[12.5px] font-semibold text-text-3">
          {percent}%
        </span>
        <span className="text-[13.5px] font-bold tabular-nums">
          {formatMoney(amount)}
        </span>
      </div>
      <div className="h-[7px] overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full"
          style={{ background: color, width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function EmptyReport() {
  return (
    <p className="py-8 text-center text-[14px] text-text-2">
      Sem despesas registradas neste mês.
    </p>
  )
}

function ReportsSkeleton() {
  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Skeleton height={92} />
        <Skeleton height={92} />
        <Skeleton height={92} />
      </div>
      <Skeleton height={280} />
    </>
  )
}
