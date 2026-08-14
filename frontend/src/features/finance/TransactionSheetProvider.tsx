import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import { TransactionFormSheet } from './components/TransactionFormSheet'
import { SeriesScopeDialog } from './components/SeriesScopeDialog'
import {
  useCategories,
  useCreateTransaction,
  useMembers,
  useUpdateTransaction,
} from './hooks'
import type { Transaction, TransactionInput, TransactionScope } from './types'

interface TransactionSheetContextValue {
  openNew: () => void
  openEdit: (transaction: Transaction) => void
}

const TransactionSheetContext =
  createContext<TransactionSheetContextValue | null>(null)

type SheetState = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; transaction: Transaction }

export function TransactionSheetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SheetState>({ mode: 'closed' })
  const [pendingEdit, setPendingEdit] = useState<{
    id: string
    input: TransactionInput
  } | null>(null)
  const { showToast } = useToast()
  const categoriesQuery = useCategories()
  const membersQuery = useMembers()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()

  const close = () => {
    setPendingEdit(null)
    setState({ mode: 'closed' })
  }

  const editing = state.mode === 'edit' ? state.transaction : null
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
      },
    )
  }

  return (
    <TransactionSheetContext.Provider
      value={{
        openNew: () => setState({ mode: 'new' }),
        openEdit: (transaction) => setState({ mode: 'edit', transaction }),
      }}
    >
      {children}

      {state.mode !== 'closed' && (
        <TransactionFormSheet
          key={editing?.id ?? 'new'}
          editing={editing}
          categories={categoriesQuery.data ?? []}
          members={membersQuery.data ?? []}
          saving={saving}
          onClose={close}
          onSubmit={(input) => {
            if (!editing) {
              createMutation.mutate(input, {
                onSuccess: () => {
                  close()
                  showToast('Lançamento salvo com sucesso')
                },
              })
              return
            }
            if (editing.seriesId) {
              setPendingEdit({ id: editing.id, input })
              return
            }
            applyEdit(editing.id, input, 'one')
          }}
        />
      )}

      {pendingEdit && editing && (
        <SeriesScopeDialog
          transaction={editing}
          action="edit"
          busy={updateMutation.isPending}
          onChoose={(scope) =>
            applyEdit(pendingEdit.id, pendingEdit.input, scope)
          }
          onCancel={() => setPendingEdit(null)}
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
