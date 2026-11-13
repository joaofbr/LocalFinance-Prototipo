import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import { promptInstall, useInstallPromptState } from './installPrompt'
import { detectMobilePlatform, isRunningAsApp } from './platform'

export function useAddToHomeScreen() {
  const { showToast } = useToast()
  const { canPrompt, installed } = useInstallPromptState()
  const [platform] = useState(detectMobilePlatform)
  const [runningAsApp] = useState(isRunningAsApp)
  const [sheetOpen, setSheetOpen] = useState(false)

  const install = async () => {
    if (await promptInstall()) {
      setSheetOpen(false)
      showToast('Pronto! O Poupi está na sua tela inicial.')
    }
  }

  const start = () => {
    if (canPrompt) void install()
    else setSheetOpen(true)
  }

  const openSheet = useCallback(() => setSheetOpen(true), [])
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  return {
    platform,
    available: platform !== null && !runningAsApp && !installed,
    canPrompt,
    install,
    start,
    sheetOpen,
    openSheet,
    closeSheet,
  }
}
