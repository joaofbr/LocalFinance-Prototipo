import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { plural } from '@/lib/format'
import { CategoryIconBadge } from '@/features/finance/components/CategoryIconBadge'
import type { Category, CategoryInput, CategoryKind } from '@/features/finance/types'
import {
  useCategories,
  useCategoryUsage,
  useCreateCategory,
  useSetCategoryActive,
  useUpdateCategory,
} from '@/features/finance/hooks'
import { CategoryFormModal } from '../components/CategoryFormModal'

const KIND_LABELS: Record<CategoryKind, string> = {
  income: 'Receita',
  expense: 'Despesa',
  both: 'Receita e despesa',
}

export function CategoriesPage() {
  const { showToast } = useToast()
  const categoriesQuery = useCategories()
  const usageQuery = useCategoryUsage()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const setActiveMutation = useSetCategoryActive()

  const [modal, setModal] = useState<{ editing: Category | null } | null>(null)

  const categories = categoriesQuery.data ?? []
  const usage = usageQuery.data ?? {}
  const saving = createMutation.isPending || updateMutation.isPending

  const showError = (fallback: string) => (error: unknown) =>
    showToast(getApiErrorMessage(error, fallback), 'warning')

  const handleSubmit = (input: CategoryInput) => {
    if (modal?.editing) {
      updateMutation.mutate(
        { id: modal.editing.id, input },
        {
          onSuccess: () => {
            setModal(null)
            showToast('Categoria atualizada')
          },
          onError: showError('Não foi possível salvar a categoria'),
        },
      )
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          setModal(null)
          showToast('Categoria criada')
        },
        onError: showError('Não foi possível criar a categoria'),
      })
    }
  }

  const handleToggle = (category: Category) => {
    setActiveMutation.mutate(
      { id: category.id, active: !category.active },
      {
        onSuccess: () =>
          showToast(
            category.active ? 'Categoria inativada' : 'Categoria reativada',
            'neutral',
          ),
        onError: showError('Não foi possível alterar a categoria'),
      },
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13.5px] text-text-2">
          Organize receitas e despesas por categoria.
        </p>
        <Button
          type="button"
          className="flex-shrink-0"
          onClick={() => setModal({ editing: null })}
        >
          <Icon name="plus" size={18} />
          Nova
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {categoriesQuery.isError ? (
          <QueryError onRetry={() => void categoriesQuery.refetch()} />
        ) : categoriesQuery.isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={52} />
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              count={usage[category.id] ?? 0}
              onEdit={() => setModal({ editing: category })}
              onToggle={() => handleToggle(category)}
            />
          ))
        )}
      </div>

      {modal && (
        <CategoryFormModal
          editing={modal.editing}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

interface CategoryRowProps {
  category: Category
  count: number
  onEdit: () => void
  onToggle: () => void
}

function CategoryRow({ category, count, onEdit, onToggle }: CategoryRowProps) {
  return (
    <div
      className={`flex items-center gap-2 border-b border-border pr-4 last:border-b-0 ${
        category.active ? '' : 'opacity-60'
      }`}
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${category.name}`}
        className="flex min-w-0 flex-1 items-center gap-3.5 py-3.5 pl-4 text-left transition-colors hover:bg-surface-2/60"
      >
        <CategoryIconBadge
          icon={category.icon}
          color={category.color}
          size={42}
          iconSize={20}
          muted={!category.active}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-semibold">
            {category.name}
            {!category.active && (
              <span className="ml-2 text-[12px] font-medium text-text-3">
                (inativa)
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-text-3">
            {KIND_LABELS[category.kind]} · {plural(count, 'lançamento', 'lançamentos')}
          </span>
        </span>
        <span
          aria-hidden
          className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-border text-text-2 sm:flex"
        >
          <Icon name="pencil" size={16} />
        </span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="flex-shrink-0 whitespace-nowrap rounded-[10px] border border-border-strong px-3 py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2"
      >
        {category.active ? 'Inativar' : 'Reativar'}
      </button>
    </div>
  )
}
