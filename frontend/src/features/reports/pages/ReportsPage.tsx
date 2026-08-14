import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney, formatMonthShort, formatSignedMoney } from '@/lib/format'
import { MonthSelector } from '@/features/finance/components/MonthSelector'
import { usePeriod } from '@/features/finance/PeriodContext'
import {
  useCategories,
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

  const transactions = transactionsQuery.data ?? []
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
        {TABS.map((option) => (
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

      {isLoading ? (
        <ReportsSkeleton />
      ) : tab === 'summary' ? (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <ReportStat
              label="Receitas"
              value={formatMoney(summary.income)}
              color="var(--income)"
            />
            <ReportStat
              label="Despesas"
              value={formatMoney(summary.expense)}
              color="var(--expense)"
            />
            <ReportStat
              label="Saldo"
              value={formatSignedMoney(summary.balance)}
              color={summary.balance >= 0 ? 'var(--income)' : 'var(--expense)'}
            />
          </div>
          <TrendChart points={trendQuery.data ?? []} />
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

function ReportStat({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-[18px] border border-border bg-surface px-[18px] py-4 shadow-card">
      <div className="mb-[7px] text-[12.5px] font-semibold text-text-2">
        {label}
      </div>
      <div
        className="text-[21px] font-extrabold tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  )
}

function TrendChart({ points }: { points: MonthlyTrendPoint[] }) {
  const max = Math.max(...points.map((p) => Math.max(p.income, p.expense)), 0)
  const barHeight = (value: number) => (max ? (value / max) * 130 : 0)

  return (
    <div className="rounded-[20px] border border-border bg-surface p-[22px] shadow-card">
      <div className="mb-1.5 text-[15px] font-bold">
        Evolução dos últimos 6 meses
      </div>
      <div className="mb-[18px] flex items-center gap-4 text-[12.5px] text-text-2">
        <span className="flex items-center gap-1.5">
          <span className="h-[11px] w-[11px] rounded-[3px] bg-income" />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[11px] w-[11px] rounded-[3px] bg-expense" />
          Despesas
        </span>
      </div>
      <div className="flex h-40 items-end justify-between gap-2.5">
        {points.map((point) => (
          <div
            key={`${point.year}-${point.month}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="flex h-[130px] items-end gap-1">
              <div
                title={formatMoney(point.income)}
                className="w-[13px] rounded-t-[5px] bg-income"
                style={{ height: barHeight(point.income) }}
              />
              <div
                title={formatMoney(point.expense)}
                className="w-[13px] rounded-t-[5px] bg-expense"
                style={{ height: barHeight(point.expense) }}
              />
            </div>
            <span className="text-[12px] font-semibold text-text-3">
              {formatMonthShort(point.month)}
            </span>
          </div>
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
