import { formatMoney, formatSignedMoney } from '@/lib/format'
import type { MonthlySummary } from '../selectors'
import { StatCard } from './StatCard'

export function MonthSummaryCards({ summary }: { summary: MonthlySummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-3.5">
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
        valueColor={summary.balance >= 0 ? 'var(--income)' : 'var(--expense)'}
        className="order-first col-span-2 lg:order-none lg:col-span-1"
      />
    </div>
  )
}
