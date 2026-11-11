import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import { useAuth } from '@/features/auth/useAuth'
import { defaultDateInPeriod } from '@/lib/format'
import { TransactionFormSheet } from './components/TransactionFormSheet'
import { SeriesScopeDialog } from './components/SeriesScopeDialog'
import { usePeriod } from './PeriodContext'
import {
  useCategories,
  useCreateTransaction,
  useHasFamily,
  useMembers,
  useUpdateTransaction,
} from './hooks'
import type { TransactionEntry } from './transactionEntries'
import type { TransactionInput, TransactionScope } from './types'

interface TransactionSheetContextValue {
  openNew: () => void
  openEdit: (entry: TransactionEntry) => void
}

const TransactionSheetContext =
  createContext<TransactionSheetContextValue | null>(null)

type SheetState =
  | { mode: 'closed' }
  | { mode: 'new' }
  | { mode: 'edit'; entry: TransactionEntry }

export function TransactionSheetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SheetState>({ mode: 'closed' })
  const [pendingEdit, setPendingEdit] = useState<{
    id: string
    input: TransactionInput
  } | null>(null)
  const { showToast } = useToast()
  const { user } = useAuth()
  const { year, month } = usePeriod()
  const categoriesQuery = useCategories()
  const membersQuery = useMembers()
  const hasFamily = useHasFamily()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()

  const close = () => {
    setPendingEdit(null)
    setState({ mode: 'closed' })
  }

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
      },
    )
  }

  return (
    <TransactionSheetContext.Provider
      value={{
        openNew: () => setState({ mode: 'new' }),
        openEdit: (entry) => setState({ mode: 'edit', entry }),
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
          hasFamily={hasFamily}
          currentUserId={user?.id ?? ''}
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
