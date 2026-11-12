import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from './api'
import type { Card, CardInput } from './types'

export function useCards() {
  return useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: () => cardsApi.getCards(),
  })
}

function useInvalidateCards() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['cards'] })
}

export function useSaveCard() {
  const invalidate = useInvalidateCards()
  return useMutation({
    mutationFn: ({ id, input }: { id: string | null; input: CardInput }) =>
      id ? cardsApi.updateCard(id, input) : cardsApi.createCard(input),
    onSuccess: invalidate,
  })
}

export function useSetCardActive() {
  const invalidate = useInvalidateCards()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      cardsApi.setCardActive(id, active),
    onSuccess: invalidate,
  })
}

export function useAssignCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, transactionIds }: { cardId: string; transactionIds: string[] }) =>
      cardsApi.assignCard(cardId, transactionIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
