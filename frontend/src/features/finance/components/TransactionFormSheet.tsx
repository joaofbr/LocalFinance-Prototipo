import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatCents, hexToRgba } from '@/lib/format'
import { AmountInput } from './AmountInput'
import type {
  Category,
  Member,
  SeriesKind,
  Transaction,
  TransactionInput,
  TransactionType,
} from '../types'

interface TransactionFormSheetProps {
  editing: Transaction | null
  categories: Category[]
  members: Member[]
  currentUserId: string
  saving: boolean
  onClose: () => void
  onSubmit: (input: TransactionInput) => void
}

const TODAY = new Date().toISOString().slice(0, 10)

const REPEAT_OPTIONS = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 36, 48, 60,
]

export function TransactionFormSheet({
  editing,
  categories,
  members,
  currentUserId,
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
  const [memberIds, setMemberIds] = useState<string[]>(() =>
    editing ? [editing.memberId] : currentUserId ? [currentUserId] : [],
  )
  const [description, setDescription] = useState(editing?.description ?? '')
  const [repeatMode, setRepeatMode] = useState<SeriesKind | 'none'>('none')
  const [repeat, setRepeat] = useState(12)
  const [errors, setErrors] = useState<{
    amount?: string
    category?: string
    members?: string
  }>({})

  const availableCategories = categories.filter(
    (c) => c.active && (c.kind === type || c.kind === 'both'),
  )

  const activeMembers = members.filter((m) => m.active || memberIds.includes(m.id))
  const sharing = !editing && memberIds.length > 1

  const toggleMember = (id: string) => {
    setErrors((e) => ({ ...e, members: undefined }))
    if (editing) {
      setMemberIds([id])
      return
    }
    setMemberIds((current) =>
      current.includes(id)
        ? current.filter((m) => m !== id)
        : [...current, id],
    )
  }

  const canRepeat = !editing
  const repeating = canRepeat && repeatMode !== 'none'
  const splitting = repeating && repeatMode === 'installment'

  const changeType = (next: TransactionType) => {
    setType(next)
    setCategoryId('')
    if (next === 'income' && repeatMode === 'installment') {
      setRepeatMode('none')
    }
    setErrors((e) => ({ ...e, category: undefined }))
  }

  const handleSubmit = () => {
    const nextErrors: typeof errors = {}
    if (cents <= 0) nextErrors.amount = 'Informe um valor maior que zero.'
    if (!categoryId) nextErrors.category = 'Selecione uma categoria.'
    if (memberIds.length === 0) {
      nextErrors.members = 'Selecione ao menos um integrante.'
    }
    if (nextErrors.amount || nextErrors.category || nextErrors.members) {
      setErrors(nextErrors)
      return
    }
    const category = categories.find((c) => c.id === categoryId)
    onSubmit({
      type,
      amount: cents / 100,
      date,
      categoryId,
      memberIds,
      description: description.trim() || category?.name || 'Lançamento',
      repeat: repeating ? repeat : 1,
      repeatMode: repeating ? repeatMode : undefined,
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
          {cents > 0 && (repeating || sharing) && (
            <div className="mt-1.5 text-center text-[12.5px] font-semibold text-text-2">
              {splitting
                ? `${repeat}x de R$ ${formatCents(Math.round(cents / repeat / memberIds.length))}`
                : repeating
                  ? `R$ ${formatCents(Math.round(cents / memberIds.length))} por mês, durante ${repeat} meses`
                  : `R$ ${formatCents(Math.round(cents / memberIds.length))} para cada`}
              {sharing && splitting && ' para cada'}
            </div>
          )}

          <label className="mb-2 mt-4 block text-[13px] font-semibold text-text-2">
            {editing ? 'Integrante' : 'De quem é'}
          </label>
          <div className="flex flex-wrap gap-2">
            {activeMembers.map((member) => {
              const selected = memberIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleMember(member.id)}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-semibold"
                  style={{
                    borderColor: selected ? member.color : 'var(--border-strong)',
                    background: selected
                      ? hexToRgba(member.color, 0.14)
                      : 'transparent',
                    color: selected ? member.color : 'var(--text2)',
                  }}
                >
                  {member.id === currentUserId ? 'Eu' : member.name}
                </button>
              )
            })}
          </div>
          {errors.members && (
            <div className="mt-2 text-[12.5px] font-semibold text-expense">
              {errors.members}
            </div>
          )}
          {sharing && (
            <p className="mt-2 text-[12px] leading-relaxed text-text-3">
              O valor será dividido igualmente entre os {memberIds.length}{' '}
              selecionados.
            </p>
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
            {canRepeat && (
              <div className="flex-1">
                <label
                  htmlFor="repeatMode"
                  className="mb-1.5 block text-[13px] font-semibold text-text-2"
                >
                  Repetição
                </label>
                <select
                  id="repeatMode"
                  value={repeatMode}
                  onChange={(e) =>
                    setRepeatMode(e.target.value as SeriesKind | 'none')
                  }
                  className="w-full cursor-pointer rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14px] text-text outline-none focus:border-primary"
                >
                  <option value="none">Não repete</option>
                  <option value="fixed">Fixo mensal</option>
                  {type === 'expense' && (
                    <option value="installment">Parcelado</option>
                  )}
                </select>
              </div>
            )}
          </div>

          {repeating && (
            <div className="mt-3">
              <label
                htmlFor="repeat"
                className="mb-1.5 block text-[13px] font-semibold text-text-2"
              >
                {splitting ? 'Número de parcelas' : 'Por quantos meses'}
              </label>
              <select
                id="repeat"
                value={repeat}
                onChange={(e) => setRepeat(Number(e.target.value))}
                className="w-full cursor-pointer rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14px] text-text outline-none focus:border-primary"
              >
                {REPEAT_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {splitting ? `${count}x` : `${count} meses`}
                  </option>
                ))}
              </select>
              {!splitting && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-text-3">
                  Cria um lançamento por mês com o mesmo valor. Quando acabar,
                  basta cadastrar de novo.
                </p>
              )}
            </div>
          )}

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
