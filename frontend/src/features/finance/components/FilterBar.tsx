import { Icon } from '@/components/ui/Icon'
import type { Category, Member } from '../types'
import { DEFAULT_FILTERS } from '../transactionFilters'
import type { TransactionFilters } from '../transactionFilters'

interface FilterBarProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
  categories: Category[]
  members: Member[]
  showMembers: boolean
}

const selectClass =
  'w-full min-w-0 cursor-pointer rounded-[10px] border border-border-strong bg-surface px-2.5 py-[9px] text-[13.5px] font-medium text-text outline-none focus:border-primary sm:w-auto'

export function FilterBar({
  filters,
  onChange,
  categories,
  members,
  showMembers,
}: FilterBarProps) {
  const isActive =
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.memberId !== 'all'

  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-3 shadow-card sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
      <span className="hidden items-center gap-1.5 text-[13px] font-semibold text-text-2 sm:flex">
        <Icon name="filter" size={16} />
        Filtros
      </span>

      <select
        aria-label="Tipo"
        value={filters.type}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as TransactionFilters['type'] })
        }
        className={selectClass}
      >
        <option value="all">Tipo: todos</option>
        <option value="income">Receitas</option>
        <option value="expense">Despesas</option>
      </select>

      <select
        aria-label="Categoria"
        value={filters.categoryId}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
        className={selectClass}
      >
        <option value="all">Categoria: todas</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {showMembers && (
        <select
          aria-label="Integrante"
          value={filters.memberId}
          onChange={(e) => onChange({ ...filters, memberId: e.target.value })}
          className={`${selectClass} ${isActive ? '' : 'col-span-2'}`}
        >
          <option value="all">Integrante: todos</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      )}

      {isActive && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className={`rounded-[10px] border border-border-strong px-3 py-[9px] text-[13px] font-semibold text-text-2 hover:bg-surface-2 ${
            showMembers ? '' : 'col-span-2'
          }`}
        >
          Limpar
        </button>
      )}
    </div>
  )
}
