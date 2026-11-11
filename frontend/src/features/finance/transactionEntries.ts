import type { Transaction } from './types'

export interface TransactionEntry {
  key: string
  transaction: Transaction
  parts: Transaction[]
  total: number
  memberIds: string[]
}

export function groupTransactions(transactions: Transaction[]): TransactionEntry[] {
  const entries = new Map<string, TransactionEntry>()
  for (const t of transactions) {
    const key = t.seriesId ? `${t.seriesId}:${t.seriesIndex ?? 1}` : t.id
    const entry = entries.get(key)
    if (!entry) {
      entries.set(key, {
        key,
        transaction: t,
        parts: [t],
        total: t.amount,
        memberIds: [t.memberId],
      })
      continue
    }
    entry.parts.push(t)
    entry.total = roundCents(entry.total + t.amount)
    if (!entry.memberIds.includes(t.memberId)) entry.memberIds.push(t.memberId)
  }
  return [...entries.values()]
}

export function shareOf(entry: TransactionEntry, memberId: string): number {
  return roundCents(
    entry.parts
      .filter((p) => p.memberId === memberId)
      .reduce((acc, p) => acc + p.amount, 0),
  )
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}
