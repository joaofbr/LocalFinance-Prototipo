import { useEffect, useState } from 'react'
import { BrandMark } from '@/components/ui/BrandMark'
import { Icon } from '@/components/ui/Icon'
import { useWelcomePending } from '@/features/onboarding/hooks'
import { InstallSheet } from './InstallSheet'
import { useAddToHomeScreen } from './useAddToHomeScreen'

const SNOOZE_KEY = 'lf.install-hint-snoozed-at'
const SNOOZE_DAYS = 30
const WELCOME_KEY = 'lf.install-welcome-shown'
const WELCOME_DELAY_MS = 1500

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

function wasWelcomed(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1'
  } catch {
    return true
  }
}

function markWelcomed(): void {
  try {
    localStorage.setItem(WELCOME_KEY, '1')
  } catch {
    return
  }
}

export function InstallBanner() {
  const { platform, available, canPrompt, install, start, sheetOpen, openSheet, closeSheet } =
    useAddToHomeScreen()
  const [hidden, setHidden] = useState(isSnoozed)
  const [openedOnWelcome, setOpenedOnWelcome] = useState(false)
  const welcomePending = useWelcomePending()

  useEffect(() => {
    if (!available || hidden || welcomePending || wasWelcomed()) return
    const timer = window.setTimeout(() => {
      markWelcomed()
      setOpenedOnWelcome(true)
      openSheet()
    }, WELCOME_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [available, hidden, welcomePending, openSheet])

  if (!available || !platform || hidden) return null

  const dismiss = () => {
    snooze()
    setHidden(true)
  }

  const handleSheetClose = () => {
    closeSheet()
    if (openedOnWelcome) setOpenedOnWelcome(false)
    else dismiss()
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
          onClick={start}
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

      {sheetOpen && (
        <InstallSheet
          platform={platform}
          canPrompt={canPrompt}
          onInstall={() => void install()}
          onClose={handleSheetClose}
        />
      )}
    </>
  )
}
