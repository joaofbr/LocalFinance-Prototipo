import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastProvider'
import { useAuth } from '@/features/auth/useAuth'
import { getApiErrorMessage } from '@/lib/apiError'
import { defaultDateInPeriod } from '@/lib/format'
import { billLabel, billMonth } from '@/features/cards/billing'
import { useCards } from '@/features/cards/hooks'
import { readLastCardId, rememberLastCardId } from '@/features/cards/lastCard'
import { TransactionFormSheet } from './components/TransactionFormSheet'
import { SeriesScopeDialog } from './components/SeriesScopeDialog'
import { usePeriod } from './PeriodContext'
import {
  useCategories,
  useCreateTransaction,
  useDeleteTransaction,
  useHasFamily,
  useMembers,
  useUpdateTransaction,
} from './hooks'
import type { TransactionEntry } from './transactionEntries'
import type { Transaction, TransactionInput, TransactionScope } from './types'

interface TransactionSheetContextValue {
  openNew: () => void
  openEdit: (entry: TransactionEntry) => void
  requestDelete: (transaction: Transaction) => void
}

const TransactionSheetContext =
  createContext<TransactionSheetContextValue | null>(null)

type SheetState =
  | { mode: 'closed' }
  | { mode: 'new' }
  | { mode: 'edit'; entry: TransactionEntry }

const DELETE_MESSAGE: Record<TransactionScope, string> = {
  one: 'Lançamento excluído',
  future: 'Lançamentos futuros excluídos',
  all: 'Série excluída',
}

export function TransactionSheetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SheetState>({ mode: 'closed' })
  const [pendingEdit, setPendingEdit] = useState<{
    id: string
    input: TransactionInput
  } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)
  const { showToast } = useToast()
  const { user } = useAuth()
  const { year, month } = usePeriod()
  const categoriesQuery = useCategories()
  const membersQuery = useMembers()
  const cards = useCards().data ?? []
  const hasFamily = useHasFamily()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const close = () => {
    setPendingEdit(null)
    setState({ mode: 'closed' })
  }

  const showError = (fallback: string) => (error: unknown) =>
    showToast(getApiErrorMessage(error, fallback), 'warning')

  const editing = state.mode === 'edit' ? state.entry : null
  const saving = createMutation.isPending || updateMutation.isPending

  const applyEdit = (
    id: string,
    input: TransactionInput,
    scope: TransactionScope,
  ) => {
    updateMutation.mutate(
      { id, input, scope },
      {
        onSuccess: () => {
          close()
          showToast(
            scope === 'one' ? 'Lançamento atualizado' : 'Série atualizada',
          )
        },
        onError: (error) => {
          setPendingEdit(null)
          showError('Não foi possível salvar o lançamento')(error)
        },
      },
    )
  }

  const remove = (transaction: Transaction, scope: TransactionScope) =>
    deleteMutation.mutate(
      { id: transaction.id, scope },
      {
        onSuccess: () => {
          setPendingDelete(null)
          close()
          showToast(DELETE_MESSAGE[scope], 'neutral')
        },
        onError: (error) => {
          setPendingDelete(null)
          showError('Não foi possível excluir o lançamento')(error)
        },
      },
    )

  const isSeries = (pendingDelete?.seriesTotal ?? 1) > 1
  const userId = user?.id ?? ''
  const lastCardId = readLastCardId(userId)
  const defaultCardId = cards.some((c) => c.active && c.id === lastCardId) ? lastCardId : ''

  const create = (input: TransactionInput) => {
    const card = cards.find((c) => c.id === input.cardId)
    createMutation.mutate(input, {
      onSuccess: () => {
        close()
        if (input.type === 'expense') rememberLastCardId(userId, card?.id ?? '')
        showToast(
          card
            ? `Lançamento salvo na fatura de ${billLabel(billMonth(card, input.date))}`
            : 'Lançamento salvo',
        )
      },
      onError: showError('Não foi possível salvar o lançamento'),
    })
  }

  return (
    <TransactionSheetContext.Provider
      value={{
        openNew: () => setState({ mode: 'new' }),
        openEdit: (entry) => setState({ mode: 'edit', entry }),
        requestDelete: setPendingDelete,
      }}
    >
      {children}

      {state.mode !== 'closed' && (
        <TransactionFormSheet
          key={editing?.key ?? 'new'}
          editing={editing}
          defaultDate={defaultDateInPeriod(year, month)}
          categories={categoriesQuery.data ?? []}
          members={membersQuery.data ?? []}
          cards={cards}
          defaultCardId={defaultCardId}
          hasFamily={hasFamily}
          currentUserId={userId}
          saving={saving}
          onClose={close}
          onDelete={
            editing ? () => setPendingDelete(editing.transaction) : undefined
          }
          onSubmit={(input) => {
            if (!editing) {
              create(input)
              return
            }
            const { transaction } = editing
            if ((transaction.seriesTotal ?? 1) > 1) {
              setPendingEdit({ id: transaction.id, input })
              return
            }
            applyEdit(transaction.id, input, 'one')
          }}
        />
      )}

      {pendingEdit && editing && (
        <SeriesScopeDialog
          transaction={editing.transaction}
          action="edit"
          busy={updateMutation.isPending}
          onChoose={(scope) =>
            applyEdit(pendingEdit.id, pendingEdit.input, scope)
          }
          onCancel={() => setPendingEdit(null)}
        />
      )}

      {pendingDelete && isSeries && (
        <SeriesScopeDialog
          transaction={pendingDelete}
          action="delete"
          busy={deleteMutation.isPending}
          onChoose={(scope) => remove(pendingDelete, scope)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {pendingDelete && !isSeries && (
        <ConfirmDialog
          title="Excluir lançamento"
          message={`“${pendingDelete.description}” será excluído${
            (pendingDelete.splitTotal ?? 0) > 1
              ? ', junto com a parte de todos os integrantes'
              : ''
          }. Não dá para desfazer.`}
          confirmLabel="Excluir"
          destructive
          busy={deleteMutation.isPending}
          onConfirm={() => remove(pendingDelete, 'one')}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </TransactionSheetContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransactionSheet(): TransactionSheetContextValue {
  const context = useContext(TransactionSheetContext)
  if (!context) {
    throw new Error(
      'useTransactionSheet must be used within a TransactionSheetProvider',
    )
  }
  return context
}
