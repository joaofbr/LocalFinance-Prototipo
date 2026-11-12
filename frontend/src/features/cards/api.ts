import { apiClient } from '@/api/client'
import type { Card, CardInput } from './types'

export const cardsApi = {
  async getCards(): Promise<Card[]> {
    const { data } = await apiClient.get<Card[]>('/cards')
    return data
  },

  async createCard(input: CardInput): Promise<Card> {
    const { data } = await apiClient.post<Card>('/cards', input)
    return data
  },

  async updateCard(id: string, input: CardInput): Promise<Card> {
    const { data } = await apiClient.put<Card>(`/cards/${id}`, input)
    return data
  },

  async setCardActive(id: string, active: boolean): Promise<Card> {
    const { data } = await apiClient.patch<Card>(`/cards/${id}/active`, { active })
    return data
  },

  async assignCard(cardId: string, transactionIds: string[]): Promise<void> {
    await apiClient.post('/transactions/assign-card', { cardId, transactionIds })
  },
}
