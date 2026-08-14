import { Icon } from '@/components/ui/Icon'
import { formatDateShort, formatMoney, getInitials, hexToRgba } from '@/lib/format'
import { CategoryIconBadge } from './CategoryIconBadge'
import { InstallmentBadge } from './InstallmentBadge'
import type { Category, Member, Transaction } from '../types'

interface TransactionListItemProps {
  transaction: Transaction
  category?: Pick<Category, 'name' | 'color' | 'icon'>
  member?: Pick<Member, 'name' | 'color'>
  onEdit: () => void
  onDelete: () => void
}

const FALLBACK_CATEGORY: Pick<Category, 'name' | 'color' | 'icon'> = {
  name: '—',
  color: '#94a3b8',
  icon: 'tag',
}
const FALLBACK_MEMBER: Pick<Member, 'name' | 'color'> = {
  name: '—',
  color: '#94a3b8',
}

export function TransactionListItem({
  transaction,
  category = FALLBACK_CATEGORY,
  member = FALLBACK_MEMBER,
  onEdit,
  onDelete,
}: TransactionListItemProps) {
  const isIncome = transaction.type === 'income'

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
      <CategoryIconBadge icon={category.icon} color={category.color} />

      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-semibold">
          {transaction.description}
        </div>
        <div className="mt-[3px] flex items-center gap-1.5 text-[12px] text-text-3">
          <span
            className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              background: hexToRgba(member.color, 0.16),
              color: member.color,
            }}
          >
            {getInitials(member.name)}
          </span>
          <span className="truncate">
            {member.name} · {category.name} · {formatDateShort(transaction.date)}
          </span>
          <InstallmentBadge transaction={transaction} />
        </div>
      </div>

      <span
        className={`whitespace-nowrap text-[15px] font-bold tabular-nums ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+ ' : '- '}
        {formatMoney(transaction.amount)}
      </span>

      <div className="flex gap-0.5">
        <button
          type="button"
          onClick={onEdit}
          title="Editar"
          aria-label="Editar"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-3 hover:bg-surface-2"
        >
          <Icon name="pencil" size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Excluir"
          aria-label="Excluir"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-3 hover:bg-surface-2 hover:text-expense"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  )
}
