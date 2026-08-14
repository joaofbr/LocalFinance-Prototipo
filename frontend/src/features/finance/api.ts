import { apiClient } from '@/api/client'
import type {
  Category,
  CategoryInput,
  Member,
  MemberInput,
  MonthlyTrendPoint,
  Transaction,
  TransactionInput,
} from './types'

export const financeApi = {
  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories')
    return data
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', input)
    return data
  },

  async updateCategory(id: string, input: CategoryInput): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, input)
    return data
  },

  async setCategoryActive(id: string, active: boolean): Promise<Category> {
    const { data } = await apiClient.patch<Category>(
      `/categories/${id}/active`,
      { active },
    )
    return data
  },

  async getCategoryUsage(): Promise<Record<string, number>> {
    const { data } =
      await apiClient.get<Record<string, number>>('/categories/usage')
    return data
  },

  async getMembers(): Promise<Member[]> {
    const { data } = await apiClient.get<Member[]>('/members')
    return data
  },

  async createMember(input: MemberInput): Promise<Member> {
    const { data } = await apiClient.post<Member>('/members', input)
    return data
  },

  async updateMember(id: string, input: MemberInput): Promise<Member> {
    const { data } = await apiClient.put<Member>(`/members/${id}`, input)
    return data
  },

  async setMemberActive(id: string, active: boolean): Promise<Member> {
    const { data } = await apiClient.patch<Member>(`/members/${id}/active`, {
      active,
    })
    return data
  },

  async deleteMember(id: string): Promise<void> {
    await apiClient.delete(`/members/${id}`)
  },

  async resendMemberInvite(id: string): Promise<void> {
    await apiClient.post(`/members/${id}/resend-invite`)
  },

  async getMonthlyTransactions(
    year: number,
    month: number,
  ): Promise<Transaction[]> {
    const { data } = await apiClient.get<Transaction[]>('/transactions', {
      params: { year, month: month + 1 },
    })
    return data
  },

  async getMonthlyTrend(
    year: number,
    month: number,
    months = 6,
  ): Promise<MonthlyTrendPoint[]> {
    const { data } = await apiClient.get<MonthlyTrendPoint[]>(
      '/reports/monthly-trend',
      { params: { year, month: month + 1, months } },
    )
    return data.map((point) => ({ ...point, month: point.month - 1 }))
  },

  async createTransaction(input: TransactionInput): Promise<Transaction> {
    const { data } = await apiClient.post<Transaction>('/transactions', input)
    return data
  },

  async updateTransaction(
    id: string,
    input: TransactionInput,
  ): Promise<Transaction> {
    const { data } = await apiClient.put<Transaction>(
      `/transactions/${id}`,
      input,
    )
    return data
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`)
  },
}
