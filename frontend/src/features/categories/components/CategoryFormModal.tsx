import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { hexToRgba } from '@/lib/format'
import type {
  Category,
  CategoryInput,
  CategoryKind,
} from '@/features/finance/types'

const COLOR_OPTIONS = [
  '#059669',
  '#22c55e',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#f43f5e',
  '#ec4899',
  '#8b5cf6',
  '#6366f1',
  '#0ea5e9',
  '#14b8a6',
]

const ICON_OPTIONS: IconName[] = [
  'cart',
  'home',
  'car',
  'utensils',
  'heart',
  'cap',
  'film',
  'zap',
  'wallet',
  'laptop',
  'trendingUp',
  'tag',
]

const KIND_OPTIONS: { value: CategoryKind; label: string }[] = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
  { value: 'both', label: 'Ambos' },
]

interface CategoryFormModalProps {
  editing: Category | null
  saving: boolean
  onClose: () => void
  onSubmit: (input: CategoryInput) => void
}

export function CategoryFormModal({
  editing,
  saving,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [kind, setKind] = useState<CategoryKind>(editing?.kind ?? 'expense')
  const [color, setColor] = useState(editing?.color ?? COLOR_OPTIONS[3])
  const [icon, setIcon] = useState<IconName>(editing?.icon ?? 'cart')
  const [nameError, setNameError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Informe o nome da categoria.')
      return
    }
    onSubmit({ name: name.trim(), kind, color, icon })
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
            {editing ? 'Editar categoria' : 'Nova categoria'}
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
          <div className="mb-5 flex items-center gap-3.5">
            <div
              className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[15px]"
              style={{ background: hexToRgba(color, 0.16), color }}
            >
              <Icon name={icon} size={24} />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-semibold text-text-2">
                Nome da categoria
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(null)
                }}
                placeholder="Ex: Mercado"
                className="w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14.5px] text-text outline-none focus:border-primary"
              />
              {nameError && (
                <div className="mt-1.5 text-[12px] font-semibold text-expense">
                  {nameError}
                </div>
              )}
            </div>
          </div>

          <label className="mb-2 block text-[13px] font-semibold text-text-2">
            Tipo
          </label>
          <div className="mb-[18px] flex gap-1.5 rounded-xl bg-surface-2 p-[5px]">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setKind(option.value)}
                className={`flex-1 rounded-[9px] py-[9px] text-[13.5px] ${
                  kind === option.value
                    ? 'bg-surface font-semibold text-text shadow-card'
                    : 'font-medium text-text-2'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-[13px] font-semibold text-text-2">
            Cor
          </label>
          <div className="mb-[18px] flex flex-wrap gap-[9px]">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-label={`Cor ${option}`}
                className="h-[30px] w-[30px] rounded-[9px] border-2"
                style={{
                  background: option,
                  borderColor: color === option ? 'var(--text)' : 'transparent',
                  boxShadow:
                    color === option ? '0 0 0 2px var(--surface) inset' : 'none',
                }}
              />
            ))}
          </div>

          <label className="mb-2 block text-[13px] font-semibold text-text-2">
            Ícone
          </label>
          <div className="mb-6 flex flex-wrap gap-2">
            {ICON_OPTIONS.map((option) => {
              const selected = icon === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIcon(option)}
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-[1.5px]"
                  style={{
                    borderColor: selected ? color : 'var(--border)',
                    background: selected ? hexToRgba(color, 0.12) : 'transparent',
                    color: selected ? color : 'var(--text3)',
                  }}
                >
                  <Icon name={option} size={19} />
                </button>
              )
            })}
          </div>

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
