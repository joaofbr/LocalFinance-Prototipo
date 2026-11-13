import { useState } from 'react'
import { BrandMark } from '@/components/ui/BrandMark'
import { Icon } from '@/components/ui/Icon'
import { InstallInstructionsSheet } from './InstallInstructionsSheet'
import { useAddToHomeScreen } from './useAddToHomeScreen'

const SNOOZE_KEY = 'lf.install-hint-snoozed-at'
const SNOOZE_DAYS = 30

function isSnoozed(): boolean {
  try {
    const snoozedAt = Number(localStorage.getItem(SNOOZE_KEY))
    return snoozedAt > 0 && Date.now() - snoozedAt < SNOOZE_DAYS * 86_400_000
  } catch {
    return false
  }
}

function snooze(): void {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now()))
  } catch {
    return
  }
}

export function InstallBanner() {
  const { platform, available, start, instructionsOpen, closeInstructions } =
    useAddToHomeScreen()
  const [hidden, setHidden] = useState(isSnoozed)

  if (!available || !platform || hidden) return null

  const dismiss = () => {
    snooze()
    setHidden(true)
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-surface py-3 pl-3 pr-2 shadow-card">
        <BrandMark size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold leading-tight">Use como app</div>
          <div className="mt-0.5 text-[12.5px] leading-snug text-text-2">
            Ícone na tela inicial, em tela cheia.
          </div>
        </div>
        <button
          type="button"
          onClick={() => void start()}
          className="flex-shrink-0 rounded-[10px] bg-primary px-3.5 py-2 text-[13px] font-bold text-primary-fg"
        >
          Adicionar
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar aviso"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-text-3 hover:bg-surface-2 hover:text-text"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      {instructionsOpen && (
        <InstallInstructionsSheet
          platform={platform}
          onClose={() => {
            closeInstructions()
            dismiss()
          }}
        />
      )}
    </>
  )
}
