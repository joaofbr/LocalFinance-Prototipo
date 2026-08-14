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
  installmentGroupId?: string | null
  installmentNumber?: number | null
  installmentTotal?: number | null
}

export interface MonthlyTrendPoint {
  year: number
  month: number
  income: number
  expense: number
}

export type TransactionScope = 'one' | 'all'

export interface TransactionInput {
  type: TransactionType
  amount: number
  date: string
  categoryId: string
  memberId: string
  description: string
  installments?: number
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
  inviteSent?: boolean | null
}

export interface MemberInput {
  name: string
  email: string
  role: MemberRole
}
