import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type {
  Member,
  MemberInput,
  MemberRole,
} from '@/features/finance/types'

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'Member', label: 'Membro' },
  { value: 'Admin', label: 'Admin' },
]

interface MemberFormModalProps {
  editing: Member | null
  saving: boolean
  onClose: () => void
  onSubmit: (input: MemberInput) => void
}

export function MemberFormModal({
  editing,
  saving,
  onClose,
  onSubmit,
}: MemberFormModalProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [email, setEmail] = useState(editing?.email ?? '')
  const [role, setRole] = useState<MemberRole>(editing?.role ?? 'Member')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const handleSubmit = () => {
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Informe o nome.'
    if (!email.includes('@')) nextErrors.email = 'E-mail inválido.'
    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors)
      return
    }
    onSubmit({ name: name.trim(), email: email.trim(), role })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-[18px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-[22px] bg-surface shadow-card-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-[18px]">
          <h3 className="text-[17px] font-extrabold tracking-tight">
            {editing ? 'Editar integrante' : 'Cadastrar integrante'}
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
          <label className="mb-1.5 block text-[13px] font-semibold text-text-2">
            Nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            placeholder="Ex: Maria Souza"
            className="w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14.5px] text-text outline-none focus:border-primary"
          />
          {errors.name && (
            <div className="mt-1.5 text-[12px] font-semibold text-expense">
              {errors.name}
            </div>
          )}

          <label className="mb-1.5 mt-3.5 block text-[13px] font-semibold text-text-2">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            placeholder="maria@email.com"
            className="w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-3 py-[11px] text-[14.5px] text-text outline-none focus:border-primary"
          />
          {errors.email && (
            <div className="mt-1.5 text-[12px] font-semibold text-expense">
              {errors.email}
            </div>
          )}

          <label className="mb-2 mt-3.5 block text-[13px] font-semibold text-text-2">
            Papel
          </label>
          <div className="mb-6 flex gap-1.5 rounded-xl bg-surface-2 p-[5px]">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`flex-1 rounded-[9px] py-[9px] text-[13.5px] ${
                  role === option.value
                    ? 'bg-surface font-semibold text-text shadow-card'
                    : 'font-medium text-text-2'
                }`}
              >
                {option.label}
              </button>
            ))}
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
