import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { platformApi } from './api'
import type { Account, AccountAction, PlatformOverview } from './types'

function useIsDeveloper(): boolean {
  return useAuth().user?.developer ?? false
}

export function usePlatformOverview() {
  return useQuery<PlatformOverview>({
    queryKey: ['platform', 'overview'],
    queryFn: () => platformApi.getOverview(),
    enabled: useIsDeveloper(),
  })
}

export function usePlatformAccounts() {
  return useQuery<Account[]>({
    queryKey: ['platform', 'accounts'],
    queryFn: () => platformApi.getAccounts(),
    enabled: useIsDeveloper(),
  })
}

export function useAccountAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ account, action }: { account: Account; action: AccountAction }) =>
      platformApi.runAction(account.id, action),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['platform'] }),
  })
}
