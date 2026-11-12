import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { defaultDateInPeriod } from '@/lib/format'
import type { Member } from '@/features/finance/types'
import { billDates, billLabel, billMonth } from '../billing'
import type { Card, CardInput } from '../types'

interface CardFormModalProps {
  editing: Card | null
  members: Member[]
  showOwner: boolean
  saving: boolean
  onClose: () => void
  onSubmit: (input: CardInput) => void
}

const DAYS = Array.from({ length: 31 }, (_, index) => index + 1)

const FIELD_CLASS =
  'w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14.5px] text-text outline-none focus:border-primary'

const LABEL_CLASS = 'mb-1.5 block text-[13px] font-semibold text-text-2'

export function CardFormModal({
  editing,
  members,
  showOwner,
  saving,
  onClose,
  onSubmit,
}: CardFormModalProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [closingDay, setClosingDay] = useState(editing?.closingDay ?? 1)
  const [dueDay, setDueDay] = useState(editing?.dueDay ?? 10)
  const [ownerId, setOwnerId] = useState(editing?.ownerId ?? '')
  const [nameError, setNameError] = useState<string | null>(null)

  const now = new Date()
  const today = defaultDateInPeriod(now.getFullYear(), now.getMonth())
  const rule = { closingDay, dueDay }
  const reference = billMonth(rule, today)
  const { due } = billDates(rule, reference)
  const owners = members.filter((member) => member.active || member.id === ownerId)

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Informe o nome do cartão.')
      return
    }
    onSubmit({ name: name.trim(), closingDay, dueDay, ownerId: ownerId || null })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-[18px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[94vh] w-full max-w-[430px] overflow-y-auto rounded-[22px] bg-surface shadow-card-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-[18px]">
          <h3 className="text-[17px] font-extrabold tracking-tight">
            {editing ? 'Editar cartão' : 'Novo cartão'}
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

        <div className="p-5">
          <label htmlFor="card-name" className={LABEL_CLASS}>
            Nome do cartão
          </label>
          <input
            id="card-name"
            type="text"
            value={name}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(null)
            }}
            placeholder="Ex: Nubank"
            className={FIELD_CLASS}
          />
          {nameError && (
            <div className="mt-1.5 text-[12px] font-semibold text-expense">{nameError}</div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="card-closing" className={LABEL_CLASS}>
                Fecha no dia
              </label>
              <select
                id="card-closing"
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className={`${FIELD_CLASS} cursor-pointer`}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="card-due" className={LABEL_CLASS}>
                Vence no dia
              </label>
              <select
                id="card-due"
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className={`${FIELD_CLASS} cursor-pointer`}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showOwner && (
            <div className="mt-4">
              <label htmlFor="card-owner" className={LABEL_CLASS}>
                De quem é
              </label>
              <select
                id="card-owner"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className={`${FIELD_CLASS} cursor-pointer`}
              >
                <option value="">Da família</option>
                {owners.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="mb-6 mt-4 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-text-2">
            Uma compra feita hoje entra na fatura de{' '}
            <strong className="font-semibold text-text">{billLabel(reference)}</strong>, que
            vence em <strong className="font-semibold text-text">{due}</strong>.
          </p>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[13px] border border-border-strong py-[13px] text-[14.5px] font-semibold text-text"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-[13px] bg-primary py-[13px] text-[14.5px] font-bold text-primary-fg disabled:opacity-60"
            >
              {saving && (
                <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
              )}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
