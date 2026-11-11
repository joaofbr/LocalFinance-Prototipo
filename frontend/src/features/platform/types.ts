import type { HouseholdPlan } from '@/features/finance/types'

export interface PlatformOverview {
  activeAccounts: number
  pendingAccounts: number
  suspendedAccounts: number
  familyAccounts: number
  users: number
  signupsLast30Days: number
}

export type AccountStatus = 'pending' | 'active' | 'suspended'

export interface Account {
  id: string
  status: AccountStatus
  plan: HouseholdPlan
  createdAt: string
  ownerName: string
  ownerEmail: string
  memberCount: number
}

export type AccountAction = 'approve' | 'reject' | 'suspend' | 'reactivate'

export interface AccountActionResult {
  emailSent: boolean
}
