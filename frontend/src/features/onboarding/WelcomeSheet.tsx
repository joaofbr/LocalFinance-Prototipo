import { useState } from 'react'
import type { FormEvent } from 'react'
import { BrandMark } from '@/components/ui/BrandMark'
import { Icon } from '@/components/ui/Icon'

const EXAMPLE = 'mercado 89,90 ontem'
const MAX_LENGTH = 160

interface WelcomeSheetProps {
  firstName: string
  invited: boolean
  familyOwner: string | null
  trying: boolean
  onTry: (text: string) => void
  onClose: () => void
}

export function WelcomeSheet({
  firstName,
  invited,
  familyOwner,
  trying,
  onTry,
  onClose,
}: WelcomeSheetProps) {
  const [text, setText] = useState(EXAMPLE)
  const value = text.trim()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (value && !trying) onTry(value)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="max-h-[94vh] w-full max-w-[440px] overflow-y-auto rounded-t-[26px] bg-surface shadow-card-lg sm:rounded-[26px]"
      >
        <div className="px-6 pt-7">
          <BrandMark size={52} />
          <h2
            id="welcome-title"
            className="mt-5 text-[23px] font-extrabold leading-tight tracking-tight"
          >
            {invited ? `Boas-vindas à família, ${firstName}!` : `Boas-vindas, ${firstName}!`}
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-text-2">
            {invited
              ? `${familyOwner ?? 'Sua família'} chamou você para organizar as contas da casa juntos. Tudo fica num lugar só, e cada gasto mostra de quem é.`
              : 'Aqui você organiza o dinheiro da casa sem planilha. Comece pelo jeito mais rápido de lançar.'}
          </p>

          <form id="welcome-try" onSubmit={submit} className="mt-6">
            <label
              htmlFor="welcome-entry"
              className="mb-2 block text-[13px] font-semibold text-text-2"
            >
              Escreva um gasto como você falaria
            </label>
            <div className="flex h-[52px] items-center gap-2.5 rounded-2xl border-[1.5px] border-primary bg-surface pl-4 pr-3">
              <Icon name="message" size={19} className="flex-shrink-0 text-text-3" />
              <input
                id="welcome-entry"
                type="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={MAX_LENGTH}
                autoComplete="off"
                enterKeyHint="send"
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-text outline-none"
              />
            </div>
          </form>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-text-3">
            O Poupi entende o valor, a categoria, a data, o cartão e as parcelas. Você confere
            tudo antes de salvar.
          </p>
        </div>

        <div className="flex gap-2.5 px-6 pb-[max(18px,env(safe-area-inset-bottom))] pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border-strong py-3.5 text-[14.5px] font-semibold text-text"
          >
            Agora não
          </button>
          <button
            type="submit"
            form="welcome-try"
            disabled={!value || trying}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg shadow-card-md disabled:opacity-50"
          >
            {trying ? (
              <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-white/35 border-t-white" />
            ) : (
              <Icon name="send" size={17} />
            )}
            Experimentar
          </button>
        </div>
      </div>
    </div>
  )
}
