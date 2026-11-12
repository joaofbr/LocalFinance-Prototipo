import type { Transaction, TransactionType } from './types'

export const NO_CARD = 'none'

export interface TransactionFilters {
  type: TransactionType | 'all'
  categoryId: string | 'all'
  memberId: string | 'all'
  payment: string | 'all'
}

export const DEFAULT_FILTERS: TransactionFilters = {
  type: 'all',
  categoryId: 'all',
  memberId: 'all',
  payment: 'all',
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.memberId !== 'all' ||
    filters.payment !== 'all'
  )
}

export function matchesPayment(transaction: Transaction, payment: string): boolean {
  if (payment === 'all') return true
  if (payment === NO_CARD) return !transaction.cardId
  return transaction.cardId === payment
}
