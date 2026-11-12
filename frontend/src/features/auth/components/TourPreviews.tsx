import { Avatar } from '@/components/ui/Avatar'
import type { IconName } from '@/components/ui/Icon'
import { formatMoney } from '@/lib/format'
import { CategoryIconBadge } from '@/features/finance/components/CategoryIconBadge'
import { getDonut } from '@/features/finance/selectors'
import type { Category, Transaction } from '@/features/finance/types'


const BLUE = '#3987e5'
const ORANGE = '#d95926'
const AQUA = '#199e70'
const GREEN = '#008300'
const VIOLET = '#9085e9'
const MAGENTA = '#d55181'

function Label({ children }: { children: string }) {
  return <div className="text-[12.5px] font-semibold text-text-2">{children}</div>
}

const RECENT: {
  description: string
  meta: string
  amount: number
  income: boolean
  icon: IconName
  color: string
}[] = [
  { description: 'Salário', meta: 'Salário · 05/11', amount: 6200, income: true, icon: 'wallet', color: GREEN },
  { description: 'Aluguel', meta: 'Moradia · 10/11', amount: 1850, income: false, icon: 'home', color: BLUE },
  { description: 'Supermercado', meta: 'Mercado · 08/11', amount: 642.9, income: false, icon: 'cart', color: ORANGE },
]

export function SummaryPreview() {
  return (
    <>
      <Label>Saldo de novembro</Label>
      <div className="mt-0.5 text-[28px] font-extrabold tracking-tight text-income">
        {formatMoney(3848.03)}
      </div>
      <ul className="mt-3 border-t border-border">
        {RECENT.map((entry) => (
          <li
            key={entry.description}
            className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
          >
            <CategoryIconBadge icon={entry.icon} color={entry.color} size={34} iconSize={16} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold">
                {entry.description}
              </span>
              <span className="block truncate text-[12px] text-text-3">{entry.meta}</span>
            </span>
            <span
              className={`whitespace-nowrap text-[13.5px] font-bold tabular-nums ${
                entry.income ? 'text-income' : 'text-expense'
              }`}
            >
              {entry.income ? '+ ' : '− '}
              {formatMoney(entry.amount)}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

const DEMO_CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', kind: 'expense', color: BLUE, icon: 'home', active: true },
  { id: 'mercado', name: 'Mercado', kind: 'expense', color: ORANGE, icon: 'cart', active: true },
  { id: 'educacao', name: 'Educação', kind: 'expense', color: VIOLET, icon: 'cap', active: true },
  { id: 'transporte', name: 'Transporte', kind: 'expense', color: AQUA, icon: 'car', active: true },
  { id: 'lazer', name: 'Lazer', kind: 'expense', color: MAGENTA, icon: 'film', active: true },
]

const DEMO_EXPENSES: Transaction[] = [
  ['moradia', 1850],
  ['mercado', 642.9],
  ['educacao', 300],
  ['transporte', 268.4],
  ['lazer', 189.9],
].map(([categoryId, amount]) => ({
  id: String(categoryId),
  type: 'expense',
  amount: Number(amount),
  date: '2026-11-10',
  referenceMonth: '2026-11-01',
  categoryId: String(categoryId),
  memberId: 'demo',
  description: String(categoryId),
  cardId: null,
}))

export function CategoriesPreview() {
  const donut = getDonut(DEMO_EXPENSES, DEMO_CATEGORIES)
  return (
    <>
      <Label>Gastos de novembro</Label>
      <div className="flex flex-1 items-center gap-6">
        <div className="relative h-[156px] w-[156px] flex-shrink-0">
          <svg viewBox="0 0 42 42" className="h-full w-full">
            <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--surface2)" strokeWidth="4.5" />
            {donut.segments.map((segment, index) => (
              <circle
                key={index}
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                stroke={segment.color}
                strokeWidth="4.5"
                strokeDasharray={segment.dash}
                strokeDashoffset={segment.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-text-3">Total</span>
            <span className="text-[14px] font-extrabold">{formatMoney(donut.total)}</span>
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
          {donut.legend.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-[12.5px]">
              <span className="h-2 w-2 flex-shrink-0 rounded-[2px]" style={{ background: item.color }} />
              <span className="min-w-0 flex-1 truncate text-text-2">{item.name}</span>
              <span className="w-8 text-right tabular-nums text-text-3">{item.percent}%</span>
              <span className="font-semibold tabular-nums text-text">{formatMoney(item.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

const TREND = [
  { month: 'Jun', income: 6200, expense: 2810 },
  { month: 'Jul', income: 6200, expense: 3090 },
  { month: 'Ago', income: 6200, expense: 2940 },
  { month: 'Set', income: 6200, expense: 3150 },
  { month: 'Out', income: 6200, expense: 3280 },
  { month: 'Nov', income: 7450, expense: 3601.97 },
]

export function TrendPreview() {
  const max = Math.max(...TREND.map((p) => p.income))
  const last = TREND[TREND.length - 1]
  return (
    <>
      <Label>Últimos 6 meses</Label>
      <div className="mt-2 flex gap-5 text-[12.5px] text-text-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-chart-income" />
          Receitas <strong className="tabular-nums text-text">{formatMoney(last.income)}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-chart-expense" />
          Despesas <strong className="tabular-nums text-text">{formatMoney(last.expense)}</strong>
        </span>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 items-end justify-between gap-2 border-b border-border">
        {TREND.map((point, index) => (
          <div
            key={point.month}
            className={`flex h-full flex-1 items-end justify-center gap-[3px] rounded-t-md pt-2 ${
              index === TREND.length - 1 ? 'bg-surface-2' : ''
            }`}
          >
            <span
              className="w-[10px] rounded-t-[3px] bg-chart-income"
              style={{ height: `${(point.income / max) * 88}%` }}
            />
            <span
              className="w-[10px] rounded-t-[3px] bg-chart-expense"
              style={{ height: `${(point.expense / max) * 88}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between gap-2">
        {TREND.map((point, index) => (
          <span
            key={point.month}
            className={`flex-1 text-center text-[11px] font-semibold ${
              index === TREND.length - 1 ? 'text-text' : 'text-text-3'
            }`}
          >
            {point.month}
          </span>
        ))}
      </div>
    </>
  )
}

const FAMILY = [
  { name: 'Júlia Lima', color: ORANGE, amount: 2650.75 },
  { name: 'Rafael Lima', color: BLUE, amount: 2395.85 },
  { name: 'Pedro Lima', color: AQUA, amount: 1529.45 },
]
const FAMILY_MAX = Math.max(...FAMILY.map((person) => person.amount))

export function FamilyPreview() {
  return (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
        <CategoryIconBadge icon="cart" color={ORANGE} size={34} iconSize={16} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold">Compras do mês</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-text-3">
            <span className="flex -space-x-0.5">
              {FAMILY.map((person) => (
                <span key={person.name} className="rounded-full bg-surface ring-2 ring-surface-2">
                  <Avatar name={person.name} color={person.color} size={22} />
                </span>
              ))}
            </span>
            dividido entre 3
          </span>
        </span>
        <span className="text-right">
          <span className="block whitespace-nowrap text-[13.5px] font-bold tabular-nums text-expense">
            − {formatMoney(1462.35)}
          </span>
          <span className="block whitespace-nowrap text-[11px] tabular-nums text-text-3">
            {formatMoney(487.45)} cada
          </span>
        </span>
      </div>
      <div className="mt-4">
        <Label>Despesas por integrante</Label>
      </div>
      <ul className="mt-2.5 flex flex-col gap-3">
        {FAMILY.map((person) => (
          <li key={person.name}>
            <div className="mb-1.5 flex items-center gap-2 text-[12.5px]">
              <span className="min-w-0 flex-1 truncate font-semibold">{person.name}</span>
              <span className="font-bold tabular-nums">{formatMoney(person.amount)}</span>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(person.amount / FAMILY_MAX) * 100}%`,
                  background: person.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
