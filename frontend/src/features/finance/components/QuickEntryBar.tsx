import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { defaultDateInPeriod, todayIso } from '@/lib/format'
import { usePeriod } from '../PeriodContext'
import { useTransactionSheet } from '../TransactionSheetProvider'
import { useInterpretTransaction } from '../hooks'
import { wantsQuickEntryFocus } from '../quickEntry'

const MAX_LENGTH = 160

export function QuickEntryBar() {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { year, month } = usePeriod()

  useEffect(() => {
    if (!wantsQuickEntryFocus(location.state)) return
    inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    inputRef.current?.focus({ preventScroll: true })
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])
  const { openDraft } = useTransactionSheet()
  const { showToast } = useToast()
  const interpret = useInterpretTransaction()
  const value = text.trim()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!value || interpret.isPending) return
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

  return (
    <form onSubmit={submit} className="mb-[18px]">
      <label htmlFor="quick-entry" className="sr-only">
        Lançamento rápido
      </label>
      <div className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-border bg-surface pl-4 pr-[7px] shadow-card transition-colors focus-within:border-primary">
        <Icon name="message" size={19} className="flex-shrink-0 text-text-3" />
        <input
          ref={inputRef}
          id="quick-entry"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="Ex.: mercado 89,90 no nubank"
          autoComplete="off"
          enterKeyHint="send"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-text outline-none placeholder:text-text-3"
        />
        <button
          type="submit"
          aria-label="Ler lançamento"
          disabled={!value || interpret.isPending}
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg transition-opacity disabled:opacity-40"
        >
          {interpret.isPending ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          ) : (
            <Icon name="send" size={17} />
          )}
        </button>
      </div>
    </form>
  )
}
