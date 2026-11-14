import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { onboardingApi } from './api'
import type { Onboarding } from './types'

export const ONBOARDING_KEY = ['onboarding'] as const

export function useOnboarding() {
  return useQuery<Onboarding>({
    queryKey: ONBOARDING_KEY,
    queryFn: () => onboardingApi.get(),
    staleTime: 0,
  })
}

export function useWelcomePending(): boolean {
  const query = useOnboarding()
  return query.isPending || query.data?.showWelcome === true
}

function hasPendingGuide(onboarding: Onboarding | undefined): boolean {
  return Boolean(
    onboarding && (onboarding.checklist.length > 0 || onboarding.familyGuide.length > 0),
  )
}

export function useRefreshOnboardingOnMutations() {
  const queryClient = useQueryClient()
  useEffect(
    () =>
      queryClient.getMutationCache().subscribe((event) => {
        if (event.type !== 'updated' || event.action.type !== 'success') return
        if (!hasPendingGuide(queryClient.getQueryData<Onboarding>(ONBOARDING_KEY))) return
        void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEY })
      }),
    [queryClient],
  )
}

function useOnboardingUpdate(
  mutationFn: () => Promise<void>,
  patch: (current: Onboarding) => Onboarding,
) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  return useMutation({
    mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ONBOARDING_KEY })
      queryClient.setQueryData<Onboarding>(ONBOARDING_KEY, (current) =>
        current ? patch(current) : current,
      )
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, 'Não foi possível salvar sua escolha'), 'warning')
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEY })
    },
  })
}

export function useMarkWelcomeSeen() {
  return useOnboardingUpdate(
    () => onboardingApi.markWelcomeSeen(),
    (current) => ({ ...current, showWelcome: false }),
  )
}

export function useDismissChecklist() {
  return useOnboardingUpdate(
    () => onboardingApi.dismissChecklist(),
    (current) => ({ ...current, checklist: [] }),
  )
}

export function useDismissFamilyGuide() {
  return useOnboardingUpdate(
    () => onboardingApi.dismissFamilyGuide(),
    (current) => ({ ...current, familyGuide: [] }),
  )
}
