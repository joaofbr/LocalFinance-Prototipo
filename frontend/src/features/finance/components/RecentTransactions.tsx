import { useNavigate } from 'react-router-dom'
import { formatDateShort, formatMoney } from '@/lib/format'
import { CategoryIconBadge } from './CategoryIconBadge'
import type { Category, Transaction } from '../types'

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories: Category[]
}

const FALLBACK_CATEGORY: Pick<Category, 'name' | 'color' | 'icon'> = {
  name: '—',
  color: '#94a3b8',
  icon: 'tag',
}

export function RecentTransactions({
  transactions,
  categories,
}: RecentTransactionsProps) {
  const navigate = useNavigate()
  const byId = new Map(categories.map((c) => [c.id, c]))
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[15px] font-bold">Últimas transações</div>
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="text-[13px] font-semibold text-primary"
        >
          Ver todas
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-text-2">
          Nenhuma transação neste mês.
        </p>
      ) : (
        <div className="flex flex-col">
          {recent.map((t) => {
            const category = byId.get(t.categoryId) ?? FALLBACK_CATEGORY
            const isIncome = t.type === 'income'
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 border-b border-border py-[11px] last:border-0"
              >
                <CategoryIconBadge icon={category.icon} color={category.color} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold">
                    {t.description}
                  </div>
                  <div className="text-[12px] text-text-3">
                    {category.name} · {formatDateShort(t.date)}
                  </div>
                </div>
                <span
                  className={`whitespace-nowrap text-[15px] font-bold tabular-nums ${
                    isIncome ? 'text-income' : 'text-expense'
                  }`}
                >
                  {isIncome ? '+ ' : '- '}
                  {formatMoney(t.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
