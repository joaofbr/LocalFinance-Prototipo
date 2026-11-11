import type { Category, Member, Transaction } from './types'

export interface MonthlySummary {
  income: number
  expense: number
  balance: number
}

export interface DonutSegment {
  color: string
  dash: string
  offset: string
}

export interface DonutLegendItem {
  id: string
  name: string
  color: string
  amount: number
  percent: number
}

const MAX_DONUT_SLICES = 6
const DONUT_GAP = 0.6

type Amounted = Pick<Transaction, 'type' | 'amount'>

export function getMonthlySummary(transactions: Amounted[]): MonthlySummary {
  const income = sum(transactions.filter((t) => t.type === 'income'))
  const expense = sum(transactions.filter((t) => t.type === 'expense'))
  return { income, expense, balance: income - expense }
}

function getExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
) {
  const byId = new Map<string, Category>(categories.map((c) => [c.id, c]))
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
  }
  return [...totals.entries()]
    .map(([categoryId, amount]) => ({
      category: byId.get(categoryId),
      amount,
    }))
    .filter((e): e is { category: Category; amount: number } => Boolean(e.category))
    .sort((a, b) => b.amount - a.amount)
}

export function getDonut(transactions: Transaction[], categories: Category[]) {
  const entries = getExpensesByCategory(transactions, categories)
  const total = entries.reduce((acc, e) => acc + e.amount, 0)

  const folds = entries.length > MAX_DONUT_SLICES
  const head = folds ? entries.slice(0, MAX_DONUT_SLICES - 1) : entries
  const rest = folds ? entries.slice(MAX_DONUT_SLICES - 1) : []
  const slices = head.map((e) => ({
    id: e.category.id,
    name: e.category.name,
    color: e.category.color,
    amount: e.amount,
  }))
  if (rest.length > 0) {
    slices.push({
      id: 'other',
      name: `Outras (${rest.length})`,
      color: 'var(--chart-other)',
      amount: rest.reduce((acc, e) => acc + e.amount, 0),
    })
  }

  const gap = slices.length > 1 ? DONUT_GAP : 0
  let cumulative = 0
  const segments: DonutSegment[] = slices.map((slice) => {
    const percent = total ? (slice.amount / total) * 100 : 0
    const visible = Math.max(percent - gap, 0)
    const segment: DonutSegment = {
      color: slice.color,
      dash: `${visible.toFixed(2)} ${(100 - visible).toFixed(2)}`,
      offset: (25 - cumulative).toFixed(2),
    }
    cumulative += percent
    return segment
  })

  const legend: DonutLegendItem[] = slices.map((slice) => ({
    ...slice,
    percent: total ? Math.round((slice.amount / total) * 100) : 0,
  }))

  return { segments, legend, total }
}

interface CategoryReportEntry {
  category: Category
  amount: number
  percent: number
}

export function getCategoryReport(
  transactions: Transaction[],
  categories: Category[],
): { entries: CategoryReportEntry[]; total: number } {
  const entries = getExpensesByCategory(transactions, categories)
  const total = entries.reduce((acc, e) => acc + e.amount, 0)
  return {
    entries: entries.map((e) => ({
      ...e,
      percent: total ? Math.round((e.amount / total) * 100) : 0,
    })),
    total,
  }
}

interface MemberReportEntry {
  member: Member
  amount: number
  percent: number
}

export function getMemberReport(
  transactions: Transaction[],
  members: Member[],
): { entries: MemberReportEntry[]; total: number } {
  const byId = new Map<string, Member>(members.map((m) => [m.id, m]))
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    totals.set(t.memberId, (totals.get(t.memberId) ?? 0) + t.amount)
  }
  const entries = [...totals.entries()]
    .map(([memberId, amount]) => ({ member: byId.get(memberId), amount }))
    .filter((e): e is { member: Member; amount: number } => Boolean(e.member))
    .sort((a, b) => b.amount - a.amount)
  const total = entries.reduce((acc, e) => acc + e.amount, 0)
  return {
    entries: entries.map((e) => ({
      ...e,
      percent: total ? Math.round((e.amount / total) * 100) : 0,
    })),
    total,
  }
}

function sum(transactions: Amounted[]): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0)
}
