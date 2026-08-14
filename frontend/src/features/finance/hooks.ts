import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Category,
  CategoryInput,
  Member,
  MemberInput,
  MonthlyTrendPoint,
  Transaction,
  TransactionInput,
  TransactionScope,
} from './types'
import { financeApi } from './api'

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => financeApi.getCategories(),
  })
}

export function useCategoryUsage() {
  return useQuery<Record<string, number>>({
    queryKey: ['transactions', 'usage'],
    queryFn: () => financeApi.getCategoryUsage(),
  })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['categories'] })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (input: CategoryInput) => financeApi.createCategory(input),
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      financeApi.updateCategory(id, input),
    onSuccess: invalidate,
  })
}

export function useSetCategoryActive() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      financeApi.setCategoryActive(id, active),
    onSuccess: invalidate,
  })
}

export function useMembers() {
  return useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => financeApi.getMembers(),
  })
}

function useInvalidateMembers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['members'] })
}

export function useCreateMember() {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: (input: MemberInput) => financeApi.createMember(input),
    onSuccess: invalidate,
  })
}

export function useUpdateMember() {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MemberInput }) =>
      financeApi.updateMember(id, input),
    onSuccess: invalidate,
  })
}

export function useSetMemberActive() {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      financeApi.setMemberActive(id, active),
    onSuccess: invalidate,
  })
}

export function useDeleteMember() {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteMember(id),
    onSuccess: invalidate,
  })
}

export function useResendMemberInvite() {
  return useMutation({
    mutationFn: (id: string) => financeApi.resendMemberInvite(id),
  })
}

export function useMonthlyTransactions(year: number, month: number) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', year, month],
    queryFn: () => financeApi.getMonthlyTransactions(year, month),
  })
}

export function useMonthlyTrend(year: number, month: number) {
  return useQuery<MonthlyTrendPoint[]>({
    queryKey: ['transactions', 'trend', year, month],
    queryFn: () => financeApi.getMonthlyTrend(year, month),
  })
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: (input: TransactionInput) => financeApi.createTransaction(input),
    onSuccess: invalidate,
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: ({
      id,
      input,
      scope,
    }: {
      id: string
      input: TransactionInput
      scope?: TransactionScope
    }) => financeApi.updateTransaction(id, input, scope),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope?: TransactionScope }) =>
      financeApi.deleteTransaction(id, scope),
    onSuccess: invalidate,
  })
}
