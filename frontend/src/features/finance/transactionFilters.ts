import type { TransactionType } from './types'

export interface TransactionFilters {
  type: TransactionType | 'all'
  categoryId: string | 'all'
  memberId: string | 'all'
}

export const DEFAULT_FILTERS: TransactionFilters = {
  type: 'all',
  categoryId: 'all',
  memberId: 'all',
}
