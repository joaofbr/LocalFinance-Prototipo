import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { useHasFamily, useMembers } from '@/features/finance/hooks'
import type { Member } from '@/features/finance/types'
import { CardFormModal } from '../components/CardFormModal'
import { useCards, useSaveCard, useSetCardActive } from '../hooks'
import type { Card, CardInput } from '../types'

export function CardsPage() {
  const { showToast } = useToast()
  const cardsQuery = useCards()
  const members = useMembers().data ?? []
  const hasFamily = useHasFamily()
  const saveCard = useSaveCard()
  const setActive = useSetCardActive()
  const [modal, setModal] = useState<{ editing: Card | null } | null>(null)

  const cards = cardsQuery.data ?? []

  const showError = (fallback: string) => (error: unknown) =>
    showToast(getApiErrorMessage(error, fallback), 'warning')

  const handleSubmit = (input: CardInput) => {
    const editing = modal?.editing ?? null
    saveCard.mutate(
      { id: editing?.id ?? null, input },
      {
        onSuccess: () => {
          setModal(null)
          showToast(editing ? 'Cartão atualizado' : 'Cartão cadastrado')
        },
        onError: showError('Não foi possível salvar o cartão'),
      },
    )
  }

  const handleToggle = (card: Card) =>
    setActive.mutate(
      { id: card.id, active: !card.active },
      {
        onSuccess: () =>
          showToast(card.active ? 'Cartão arquivado' : 'Cartão reativado', 'neutral'),
        onError: showError('Não foi possível alterar o cartão'),
      },
    )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13.5px] text-text-2">
          Cada compra no cartão conta no mês em que a fatura vence.
        </p>
        <Button
          type="button"
          className="flex-shrink-0"
          onClick={() => setModal({ editing: null })}
        >
          <Icon name="plus" size={18} />
          Novo
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {cardsQuery.isError ? (
          <QueryError onRetry={() => void cardsQuery.refetch()} />
        ) : cardsQuery.isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} height={52} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <EmptyCards />
        ) : (
          cards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              ownerLabel={hasFamily ? ownerLabel(card, members) : null}
              onEdit={() => setModal({ editing: card })}
              onToggle={() => handleToggle(card)}
            />
          ))
        )}
      </div>

      {modal && (
        <CardFormModal
          editing={modal.editing}
          members={members}
          showOwner={hasFamily}
          saving={saveCard.isPending}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

function ownerLabel(card: Card, members: Member[]): string {
  return members.find((member) => member.id === card.ownerId)?.name ?? 'Da família'
}

function EmptyCards() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-surface-2 text-text-3">
        <Icon name="creditCard" size={28} strokeWidth={1.6} />
      </div>
      <div className="mb-1.5 text-[16px] font-bold">Nenhum cartão cadastrado</div>
      <p className="mx-auto max-w-[340px] text-[14px] text-text-2">
        Cadastre o cartão com o dia de fechamento e de vencimento. Depois é só lançar a
        compra com a data real: ela aparece no mês da fatura.
      </p>
    </div>
  )
}

interface CardRowProps {
  card: Card
  ownerLabel: string | null
  onEdit: () => void
  onToggle: () => void
}

function CardRow({ card, ownerLabel, onEdit, onToggle }: CardRowProps) {
  return (
    <div
      className={`flex items-center gap-2 border-b border-border pr-4 last:border-b-0 ${
        card.active ? '' : 'opacity-60'
      }`}
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${card.name}`}
        className="flex min-w-0 flex-1 items-center gap-3.5 py-3.5 pl-4 text-left transition-colors hover:bg-surface-2/60"
      >
        <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text-2">
          <Icon name="creditCard" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-semibold">
            {card.name}
            {!card.active && (
              <span className="ml-2 text-[12px] font-medium text-text-3">(arquivado)</span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-text-3">
            Fecha dia {card.closingDay} · vence dia {card.dueDay}
            {ownerLabel && ` · ${ownerLabel}`}
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
        {card.active ? 'Arquivar' : 'Reativar'}
      </button>
    </div>
  )
}
