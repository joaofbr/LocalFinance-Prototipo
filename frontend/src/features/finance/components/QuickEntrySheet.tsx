import type { ReactNode } from 'react'
import { FormAlert } from '@/components/ui/FormAlert'
import { Icon } from '@/components/ui/Icon'
import { billLabel, billMonth } from '@/features/cards/billing'
import type { Card } from '@/features/cards/types'
import { daysFromToday, formatDateMedium, formatMoney, joinNames } from '@/lib/format'
import { CategoryIconBadge } from './CategoryIconBadge'
import type { Category, Member, TransactionDraft } from '../types'

interface QuickEntrySheetProps {
  text: string
  draft: TransactionDraft
  categories: Category[]
  members: Member[]
  cards: Card[]
  hasFamily: boolean
  currentUserId: string
  saving: boolean
  onClose: () => void
  onAdjust: () => void
  onConfirm: () => void
}

function dateLabel(iso: string): string {
  const medium = formatDateMedium(iso)
  const offset = daysFromToday(iso)
  if (offset === 0) return `Hoje, ${medium}`
  if (offset === -1) return `Ontem, ${medium}`
  return medium
}

export function QuickEntrySheet({
  text,
  draft,
  categories,
  members,
  cards,
  hasFamily,
  currentUserId,
  saving,
  onClose,
  onAdjust,
  onConfirm,
}: QuickEntrySheetProps) {
  const category = categories.find((c) => c.id === draft.categoryId) ?? null
  const card = cards.find((c) => c.id === draft.cardId) ?? null
  const income = draft.type === 'income'
  const amount = draft.amount ?? 0
  const ready = draft.amount !== null && category !== null
  const installment = draft.repeatMode === 'installment' && draft.repeat > 1
  const fixed = draft.repeatMode === 'fixed' && draft.repeat > 1
  const parts = Math.max(draft.memberIds.length, 1)
  const perPart = (installment ? amount / draft.repeat : amount) / parts
  const owners = draft.memberIds.map((id) =>
    id === currentUserId ? 'Eu' : (members.find((m) => m.id === id)?.name ?? 'Integrante'),
  )

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-entry-title"
        className="max-h-[94vh] w-full max-w-[460px] overflow-y-auto rounded-t-[26px] bg-surface shadow-card-lg sm:rounded-[26px]"
      >
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-border bg-surface px-5 pb-3 pt-[18px]">
          <h3 id="quick-entry-title" className="text-[17px] font-extrabold tracking-tight">
            Confirmar lançamento
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-2"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="px-5 pb-5 pt-[18px]">
          <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3 text-[13.5px] leading-relaxed text-text-2">
            <Icon name="message" size={16} className="mt-[3px] flex-shrink-0 text-text-3" />
            <span className="min-w-0 break-words">“{text}”</span>
          </div>

          <div className="mt-5">
            <span
              className={`inline-flex rounded-lg px-2.5 py-1 text-[12.5px] font-bold ${
                income ? 'bg-income-bg text-income' : 'bg-expense-bg text-expense'
              }`}
            >
              {income ? 'Receita' : 'Despesa'}
            </span>
            <div
              className={`mt-2 text-[32px] font-extrabold leading-none tracking-tight ${
                draft.amount === null ? 'text-text-3' : income ? 'text-income' : 'text-text'
              }`}
            >
              {draft.amount === null ? 'Sem valor' : formatMoney(amount)}
            </div>
            <div className="mt-2 break-words text-[15px] font-semibold text-text-2">
              {draft.description}
            </div>
          </div>

          <dl className="mt-5 divide-y divide-border rounded-2xl border border-border">
            <Row label="Categoria">
              {category ? (
                <span className="flex items-center justify-end gap-2">
                  <CategoryIconBadge
                    icon={category.icon}
                    color={category.color}
                    size={26}
                    iconSize={14}
                  />
                  {category.name}
                </span>
              ) : (
                <span className="text-expense">Não reconhecida</span>
              )}
            </Row>
            <Row label={card ? 'Data da compra' : 'Data'}>{dateLabel(draft.date)}</Row>
            {!income && (
              <Row
                label="Pagamento"
                detail={
                  card
                    ? `${installment ? '1ª parcela na fatura de' : 'Fatura de'} ${billLabel(billMonth(card, draft.date))}`
                    : undefined
                }
              >
                {card ? `Cartão ${card.name}` : 'À vista'}
              </Row>
            )}
            {installment && (
              <Row label="Parcelas">
                {draft.repeat}x de {formatMoney(amount / draft.repeat)}
              </Row>
            )}
            {fixed && <Row label="Repetição">Todo mês, por {draft.repeat} meses</Row>}
            {hasFamily && (
              <Row
                label="De quem é"
                detail={parts > 1 ? `${formatMoney(perPart)} para cada` : undefined}
              >
                {joinNames(owners)}
              </Row>
            )}
          </dl>

          {draft.warnings.length > 0 && (
            <div className="mt-4 [&>*:last-child]:mb-0">
              {draft.warnings.map((warning) => (
                <FormAlert key={warning} tone="info" message={warning} />
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-[2] flex gap-2.5 border-t border-border bg-surface px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5">
          <button
            type="button"
            onClick={onAdjust}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-strong py-3.5 text-[14.5px] font-semibold text-text"
          >
            <Icon name="pencil" size={16} />
            Ajustar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ready || saving}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg shadow-card-md disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
            ) : (
              <Icon name="check" size={18} />
            )}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  detail,
  children,
}: {
  label: string
  detail?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="pt-[1px] text-[13px] font-semibold text-text-3">{label}</dt>
      <dd className="min-w-0 text-right text-[14px] font-semibold text-text">
        {children}
        {detail && (
          <div className="mt-0.5 text-[12.5px] font-medium text-text-2">{detail}</div>
        )}
      </dd>
    </div>
  )
}
