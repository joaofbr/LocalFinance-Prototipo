import { Icon } from '@/components/ui/Icon'
import {
  formatDateShort,
  formatMoney,
  getInitials,
  hexToRgba,
  joinNames,
} from '@/lib/format'
import { CategoryIconBadge } from './CategoryIconBadge'
import { SeriesBadge } from './SeriesBadge'
import type { TransactionEntry } from '../transactionEntries'
import type { Category, Member } from '../types'

type Participant = Pick<Member, 'id' | 'name' | 'color'>

interface TransactionListItemProps {
  entry: TransactionEntry
  amount: number
  category?: Pick<Category, 'name' | 'color' | 'icon'>
  participants: Participant[]
  showParticipants: boolean
  onEdit: () => void
  onDelete: () => void
}

const FALLBACK_CATEGORY: Pick<Category, 'name' | 'color' | 'icon'> = {
  name: '—',
  color: '#94a3b8',
  icon: 'tag',
}
const FALLBACK_MEMBER: Participant = {
  id: '',
  name: '—',
  color: '#94a3b8',
}

export function TransactionListItem({
  entry,
  amount,
  category = FALLBACK_CATEGORY,
  participants,
  showParticipants,
  onEdit,
  onDelete,
}: TransactionListItemProps) {
  const { transaction } = entry
  const isIncome = transaction.type === 'income'
  const people = participants.length > 0 ? participants : [FALLBACK_MEMBER]
  const shared = people.length > 1
  const names = joinNames(
    people.map((p) => (shared ? p.name.split(' ')[0] : p.name)),
  )
  const isShare = shared && amount !== entry.total

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
      <CategoryIconBadge icon={category.icon} color={category.color} />

      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-semibold">
          {transaction.description}
        </div>
        <div className="mt-[3px] flex items-center gap-1.5 text-[12px] text-text-3">
          {showParticipants && (
            <span
              className="flex flex-shrink-0"
              title={shared ? `Dividido entre ${joinNames(people.map((p) => p.name))}` : undefined}
            >
              {people.map((person, index) => (
                <span
                  key={person.id || index}
                  className={`rounded-full bg-surface ring-2 ring-surface ${index > 0 ? '-ml-1.5' : ''}`}
                >
                  <span
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: hexToRgba(person.color, 0.16),
                      color: person.color,
                    }}
                  >
                    {getInitials(person.name)}
                  </span>
                </span>
              ))}
            </span>
          )}
          <span className="truncate">
            {showParticipants && `${names} · `}
            {category.name} · {formatDateShort(transaction.date)}
          </span>
          <SeriesBadge transaction={transaction} showShared={false} />
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span
          className={`whitespace-nowrap text-[15px] font-bold tabular-nums ${
            isIncome ? 'text-income' : 'text-expense'
          }`}
        >
          {isIncome ? '+ ' : '- '}
          {formatMoney(amount)}
        </span>
        {isShare && (
          <span className="whitespace-nowrap text-[11px] tabular-nums text-text-3">
            de {formatMoney(entry.total)}
          </span>
        )}
      </div>

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
