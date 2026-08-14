import type { Category, Member, Transaction } from './types'

interface MonthlySummary {
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
  categoryId: string
  name: string
  color: string
  amount: number
  percent: number
}

export function getMonthlySummary(transactions: Transaction[]): MonthlySummary {
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

  let cumulative = 0
  const segments: DonutSegment[] = entries.map((e) => {
    const percent = total ? (e.amount / total) * 100 : 0
    const segment: DonutSegment = {
      color: e.category.color,
      dash: `${percent.toFixed(2)} ${(100 - percent).toFixed(2)}`,
      offset: (25 - cumulative).toFixed(2),
    }
    cumulative += percent
    return segment
  })

  const legend: DonutLegendItem[] = entries.slice(0, 6).map((e) => ({
    categoryId: e.category.id,
    name: e.category.name,
    color: e.category.color,
    amount: e.amount,
    percent: total ? Math.round((e.amount / total) * 100) : 0,
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

function sum(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0)
}
