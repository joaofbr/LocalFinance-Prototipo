import { Icon } from '@/components/ui/Icon'
import type { Category, Member } from '../types'
import { DEFAULT_FILTERS } from '../transactionFilters'
import type { TransactionFilters } from '../transactionFilters'

interface FilterBarProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
  categories: Category[]
  members: Member[]
}

const selectClass =
  'cursor-pointer rounded-[10px] border border-border-strong bg-surface px-3 py-[9px] text-[13.5px] font-medium text-text outline-none'

export function FilterBar({
  filters,
  onChange,
  categories,
  members,
}: FilterBarProps) {
  const isActive =
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.memberId !== 'all'

  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-card">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-text-2">
        <Icon name="filter" size={16} />
        Filtros
      </span>

      <select
        value={filters.type}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as TransactionFilters['type'] })
        }
        className={selectClass}
      >
        <option value="all">Todos os tipos</option>
        <option value="income">Receitas</option>
        <option value="expense">Despesas</option>
      </select>

      <select
        value={filters.categoryId}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
        className={selectClass}
      >
        <option value="all">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={filters.memberId}
        onChange={(e) => onChange({ ...filters, memberId: e.target.value })}
        className={selectClass}
      >
        <option value="all">Todos os integrantes</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>

      {isActive && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="rounded-[10px] border border-border-strong px-3 py-[9px] text-[13px] font-semibold text-text-2"
        >
          Limpar
        </button>
      )}
    </div>
  )
}
