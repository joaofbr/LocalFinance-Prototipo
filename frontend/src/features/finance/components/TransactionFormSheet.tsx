import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatCents, hexToRgba } from '@/lib/format'
import { AmountInput } from './AmountInput'
import type {
  Category,
  Member,
  Transaction,
  TransactionInput,
  TransactionType,
} from '../types'

interface TransactionFormSheetProps {
  editing: Transaction | null
  categories: Category[]
  members: Member[]
  saving: boolean
  onClose: () => void
  onSubmit: (input: TransactionInput) => void
}

const TODAY = new Date().toISOString().slice(0, 10)

const INSTALLMENT_OPTIONS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 36, 48, 60,
]

export function TransactionFormSheet({
  editing,
  categories,
  members,
  saving,
  onClose,
  onSubmit,
}: TransactionFormSheetProps) {
  const [type, setType] = useState<TransactionType>(editing?.type ?? 'expense')
  const [cents, setCents] = useState(
    editing ? Math.round(editing.amount * 100) : 0,
  )
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '')
  const [date, setDate] = useState(editing?.date ?? TODAY)
  const [memberId, setMemberId] = useState(
    editing?.memberId ?? members[0]?.id ?? '',
  )
  const [description, setDescription] = useState(editing?.description ?? '')
  const [installments, setInstallments] = useState(1)
  const [errors, setErrors] = useState<{ amount?: string; category?: string }>(
    {},
  )

  const availableCategories = categories.filter(
    (c) => c.active && (c.kind === type || c.kind === 'both'),
  )

  const canSplit = !editing && type === 'expense'
  const splitting = canSplit && installments > 1

  const changeType = (next: TransactionType) => {
    setType(next)
    setCategoryId('')
    setInstallments(1)
    setErrors((e) => ({ ...e, category: undefined }))
  }

  const handleSubmit = () => {
    const nextErrors: typeof errors = {}
    if (cents <= 0) nextErrors.amount = 'Informe um valor maior que zero.'
    if (!categoryId) nextErrors.category = 'Selecione uma categoria.'
    if (nextErrors.amount || nextErrors.category) {
      setErrors(nextErrors)
      return
    }
    const category = categories.find((c) => c.id === categoryId)
    onSubmit({
      type,
      amount: cents / 100,
      date,
      categoryId,
      memberId,
      description: description.trim() || category?.name || 'Lançamento',
      installments: splitting ? installments : 1,
    })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[94vh] w-full max-w-[460px] overflow-y-auto rounded-t-[26px] bg-surface shadow-card-lg sm:rounded-[26px]"
      >
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-border bg-surface px-5 pb-3 pt-[18px]">
          <h3 className="text-[17px] font-extrabold tracking-tight">
            {editing ? 'Editar lançamento' : 'Novo lançamento'}
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

        <div className="px-5 pb-6 pt-[18px]">
          <div className="mb-5 flex gap-2.5">
            <TypeButton
              label="Receita"
              tone="income"
              active={type === 'income'}
              onClick={() => changeType('income')}
            />
            <TypeButton
              label="Despesa"
              tone="expense"
              active={type === 'expense'}
              onClick={() => changeType('expense')}
            />
          </div>

          <AmountInput
            type={type}
            cents={cents}
            onChange={(value) => {
              setCents(value)
              setErrors((e) => ({ ...e, amount: undefined }))
            }}
          />
          {errors.amount && (
            <div className="mb-2 mt-1.5 text-center text-[12.5px] font-semibold text-expense">
              {errors.amount}
            </div>
          )}
          {splitting && cents > 0 && (
            <div className="mt-1.5 text-center text-[12.5px] font-semibold text-text-2">
              {installments}x de R$ {formatCents(Math.round(cents / installments))}
            </div>
          )}

          <label className="mb-2 mt-4 block text-[13px] font-semibold text-text-2">
            Categoria
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const selected = category.id === categoryId
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(category.id)
                    setErrors((e) => ({ ...e, category: undefined }))
                  }}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-semibold"
                  style={{
                    borderColor: selected ? category.color : 'var(--border-strong)',
                    background: selected
                      ? hexToRgba(category.color, 0.14)
                      : 'transparent',
                    color: selected ? category.color : 'var(--text2)',
                  }}
                >
                  <Icon name={category.icon} size={16} />
                  {category.name}
                </button>
              )
            })}
          </div>
          {errors.category && (
            <div className="mt-2 text-[12.5px] font-semibold text-expense">
              {errors.category}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-semibold text-text-2">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14px] text-text outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1" hidden>
              <label className="mb-1.5 block text-[13px] font-semibold text-text-2">
                Integrante
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full cursor-pointer rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14px] text-text outline-none focus:border-primary"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            {canSplit && (
              <div className="flex-1">
                <label
                  htmlFor="installments"
                  className="mb-1.5 block text-[13px] font-semibold text-text-2"
                >
                  Parcelas
                </label>
                <select
                  id="installments"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full cursor-pointer rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14px] text-text outline-none focus:border-primary"
                >
                  {INSTALLMENT_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count === 1 ? 'À vista' : `${count}x`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <label className="mb-1.5 mt-4 block text-[13px] font-semibold text-text-2">
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Supermercado do mês"
            className="mb-[22px] w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-3 text-[14.5px] text-text outline-none focus:border-primary"
          />

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border-strong py-3.5 text-[14.5px] font-semibold text-text"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg shadow-card-md disabled:opacity-60"
            >
              {saving && (
                <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
              )}
              Salvar lançamento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TypeButtonProps {
  label: string
  tone: 'income' | 'expense'
  active: boolean
  onClick: () => void
}

function TypeButton({ label, tone, active, onClick }: TypeButtonProps) {
  const activeClass =
    tone === 'income'
      ? 'border-income bg-income-bg text-income'
      : 'border-expense bg-expense-bg text-expense'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border py-3 text-[14.5px] font-bold ${active ? activeClass : 'border-border-strong bg-surface-2 text-text-2'
        }`}
    >
      {label}
    </button>
  )
}
