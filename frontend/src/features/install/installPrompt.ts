import { useSyncExternalStore } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptState {
  canPrompt: boolean
  installed: boolean
}

let deferredPrompt: InstallPromptEvent | null = null
let installed = false
let snapshot: InstallPromptState = { canPrompt: false, installed: false }
const listeners = new Set<() => void>()

function publish() {
  snapshot = { canPrompt: deferredPrompt !== null, installed }
  listeners.forEach((listener) => listener())
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredPrompt = event as InstallPromptEvent
  publish()
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  installed = true
  publish()
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useInstallPromptState(): InstallPromptState {
  return useSyncExternalStore(subscribe, () => snapshot)
}

export async function promptInstall(): Promise<boolean> {
  const event = deferredPrompt
  if (!event) return false
  deferredPrompt = null
  publish()
  await event.prompt()
  const { outcome } = await event.userChoice
  return outcome === 'accepted'
}
