import { Icon } from '@/components/ui/Icon'
import {
  formatDateShort,
  formatMoney,
  getInitials,
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
  cardName?: string
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
  cardName,
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
    <div className="group flex items-center border-b border-border last:border-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${transaction.description}`}
        className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 pr-3 text-left transition-colors hover:bg-surface-2/60 sm:pr-2"
      >
        <CategoryIconBadge icon={category.icon} color={category.color} />

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[14.5px] font-semibold">
              {transaction.description}
            </span>
            <SeriesBadge transaction={transaction} showShared={false} />
          </span>
          <span className="mt-[3px] flex items-center gap-1.5 text-[12px] text-text-3">
            {showParticipants && (
              <span
                className="flex flex-shrink-0 -space-x-0.5"
                title={joinNames(people.map((p) => p.name))}
              >
                {people.map((person, index) => (
                  <span
                    key={person.id || index}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9.5px] font-bold ring-2 ring-surface"
                    style={{
                      background: `color-mix(in srgb, ${person.color} 18%, var(--surface))`,
                      color: person.color,
                    }}
                  >
                    {getInitials(person.name)}
                  </span>
                ))}
              </span>
            )}
            <span className="truncate">
              {showParticipants && (
                <span className="hidden sm:inline">{names} · </span>
              )}
              {category.name} · {formatDateShort(transaction.date)}
              {cardName && ` · ${cardName}`}
            </span>
          </span>
        </span>

        <span className="flex flex-shrink-0 flex-col items-end">
          <span
            className={`whitespace-nowrap text-[15px] font-bold tabular-nums ${
              isIncome ? 'text-income' : 'text-expense'
            }`}
          >
            {isIncome ? '+ ' : '− '}
            {formatMoney(amount)}
          </span>
          {isShare && (
            <span className="whitespace-nowrap text-[11px] tabular-nums text-text-3">
              de {formatMoney(entry.total)}
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={onDelete}
        title="Excluir"
        aria-label={`Excluir ${transaction.description}`}
        className="mr-3 hidden h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg text-text-3 hover:bg-surface-2 hover:text-expense focus-visible:flex sm:flex"
      >
        <Icon name="trash" size={16} />
      </button>
    </div>
  )
}
