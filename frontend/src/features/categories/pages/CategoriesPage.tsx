import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastProvider'
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

const KIND_BADGES: Record<CategoryKind, { label: string; className: string }> = {
  income: { label: 'Receita', className: 'bg-income-bg text-income' },
  expense: { label: 'Despesa', className: 'bg-expense-bg text-expense' },
  both: { label: 'Ambos', className: 'bg-neutral-bg text-neutral' },
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

  const handleSubmit = (input: CategoryInput) => {
    if (modal?.editing) {
      updateMutation.mutate(
        { id: modal.editing.id, input },
        {
          onSuccess: () => {
            setModal(null)
            showToast('Categoria atualizada')
          },
        },
      )
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          setModal(null)
          showToast('Categoria criada')
        },
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
      },
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tight">
            Categorias
          </h2>
          <p className="mt-[3px] text-[13.5px] text-text-2">
            Organize receitas e despesas por categoria.
          </p>
        </div>
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
        {categoriesQuery.isLoading ? (
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
  const badge = KIND_BADGES[category.kind]
  return (
    <div
      className={`flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0 ${
        category.active ? '' : 'opacity-60'
      }`}
    >
      <CategoryIconBadge
        icon={category.icon}
        color={category.color}
        size={42}
        iconSize={20}
        muted={!category.active}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14.5px] font-semibold">{category.name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <div className="mt-0.5 text-[12.5px] text-text-3">
          {count} lançamento(s)
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        title="Editar"
        aria-label={`Editar ${category.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-text-2 hover:bg-surface-2"
      >
        <Icon name="pencil" size={16} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="whitespace-nowrap rounded-[10px] border border-border-strong px-[13px] py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2"
      >
        {category.active ? 'Inativar' : 'Reativar'}
      </button>
    </div>
  )
}
