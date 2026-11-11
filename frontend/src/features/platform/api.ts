import { apiClient } from '@/api/client'
import type {
  Account,
  AccountAction,
  AccountActionResult,
  PlatformOverview,
} from './types'

export const platformApi = {
  async getOverview(): Promise<PlatformOverview> {
    const { data } = await apiClient.get<PlatformOverview>('/platform/overview')
    return data
  },

  async getAccounts(): Promise<Account[]> {
    const { data } = await apiClient.get<Account[]>('/platform/accounts')
    return data
  },

  async runAction(
    id: string,
    action: AccountAction,
  ): Promise<AccountActionResult | null> {
    const { data } = await apiClient.post<AccountActionResult | ''>(
      `/platform/accounts/${id}/${action}`,
    )
    return data || null
  },
}
