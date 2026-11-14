import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { defaultDateInPeriod, todayIso } from '@/lib/format'
import { usePeriod } from '../PeriodContext'
import { useTransactionSheet } from '../TransactionSheetProvider'
import { useInterpretTransaction } from '../hooks'

const MAX_LENGTH = 160
const EXAMPLES = ['mercado 89,90', 'uber 25 ontem', 'recebi 3000 salário', 'tênis 600 em 3x']

export function QuickEntryBar() {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { year, month } = usePeriod()
  const { openDraft } = useTransactionSheet()
  const { showToast } = useToast()
  const interpret = useInterpretTransaction()
  const value = text.trim()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (interpret.isPending) return
    if (!value) {
      inputRef.current?.focus()
      return
    }
    interpret.mutate(
      { text: value, today: todayIso(), defaultDate: defaultDateInPeriod(year, month) },
      {
        onSuccess: (draft) => openDraft(draft, value, () => setText('')),
        onError: (error) =>
          showToast(
            getApiErrorMessage(error, 'Não foi possível ler o lançamento'),
            'warning',
          ),
      },
    )
  }

  const fillExample = (example: string) => {
    setText(example)
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={submit}
      data-tour="quick-entry"
      className="mb-[18px] rounded-2xl border border-border bg-surface p-4 shadow-card"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-weak text-primary">
          <Icon name="zap" size={16} />
        </span>
        <div className="min-w-0">
          <label htmlFor="quick-entry" className="block text-[14.5px] font-bold leading-tight">
            Lançar rápido
          </label>
          <span className="block text-[12.5px] leading-snug text-text-2">
            Escreva como você falaria. Você confere antes de salvar.
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="quick-entry"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="O que entrou ou saiu?"
          autoComplete="off"
          enterKeyHint="send"
          className="h-[48px] min-w-0 flex-1 rounded-xl border-[1.5px] border-border-strong bg-surface px-3.5 text-[16px] text-text outline-none transition-colors placeholder:text-text-3 hover:border-text-3 focus:border-primary"
        />
        <button
          type="submit"
          disabled={interpret.isPending}
          className="flex h-[48px] flex-shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-[14.5px] font-bold text-primary-fg shadow-card-md disabled:opacity-60"
        >
          {interpret.isPending ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          ) : (
            <Icon name="send" size={16} />
          )}
          Lançar
        </button>
      </div>

      <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => fillExample(example)}
            className="flex-shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-text-2 transition-colors hover:border-border-strong hover:text-text"
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  )
}
