import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { financeApi } from '@/features/finance/api'
import type { HouseholdPlan } from '@/features/finance/types'
import { ONBOARDING_KEY } from '@/features/onboarding/hooks'

export function useChangePlan() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (plan: HouseholdPlan) => financeApi.setHouseholdPlan(plan),
    onSuccess: (household) => {
      queryClient.setQueryData(['household'], household)
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEY })
      if (household.plan === 'family') {
        showToast('Modo família ativado')
        navigate('/members')
      } else {
        showToast('Sua conta voltou ao modo individual', 'neutral')
        navigate('/')
      }
    },
    onError: (error) =>
      showToast(
        getApiErrorMessage(error, 'Não foi possível mudar o modo da conta'),
        'warning',
      ),
  })
}
