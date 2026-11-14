import { apiClient } from '@/api/client'
import type { Onboarding } from './types'

export const onboardingApi = {
  async get(): Promise<Onboarding> {
    const { data } = await apiClient.get<Onboarding>('/onboarding')
    return data
  },

  async markWelcomeSeen(): Promise<void> {
    await apiClient.post('/onboarding/welcome-seen')
  },

  async dismissChecklist(): Promise<void> {
    await apiClient.post('/onboarding/checklist/dismiss')
  },

  async dismissFamilyGuide(): Promise<void> {
    await apiClient.post('/onboarding/family-guide/dismiss')
  },
}
