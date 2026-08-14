import type { IconName } from '@/components/ui/Icon'

export type TransactionType = 'income' | 'expense'

export type CategoryKind = TransactionType | 'both'

export interface Category {
  id: string
  name: string
  kind: CategoryKind
  color: string
  icon: IconName
  active: boolean
}

export interface CategoryInput {
  name: string
  kind: CategoryKind
  color: string
  icon: IconName
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  categoryId: string
  memberId: string
  description: string
}

export interface MonthlyTrendPoint {
  year: number
  month: number
  income: number
  expense: number
}

export interface TransactionInput {
  type: TransactionType
  amount: number
  date: string
  categoryId: string
  memberId: string
  description: string
}

export type MemberRole = 'Admin' | 'Member'

export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  active: boolean
  color: string
  passwordPending: boolean
}

export interface MemberInput {
  name: string
  email: string
  role: MemberRole
}
