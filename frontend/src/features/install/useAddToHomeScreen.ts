import { useState } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import { promptInstall, useInstallPromptState } from './installPrompt'
import { detectMobilePlatform, isRunningAsApp } from './platform'

export function useAddToHomeScreen() {
  const { showToast } = useToast()
  const { canPrompt, installed } = useInstallPromptState()
  const [platform] = useState(detectMobilePlatform)
  const [runningAsApp] = useState(isRunningAsApp)
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const start = async () => {
    if (!canPrompt) {
      setInstructionsOpen(true)
      return
    }
    if (await promptInstall()) {
      showToast('Pronto! O Poupi está na sua tela inicial.')
    }
  }

  return {
    platform,
    available: platform !== null && !runningAsApp && !installed,
    start,
    instructionsOpen,
    closeInstructions: () => setInstructionsOpen(false),
  }
}
