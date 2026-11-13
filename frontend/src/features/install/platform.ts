import { Capacitor } from '@capacitor/core'

export type MobilePlatform = 'ios' | 'android'

export function detectMobilePlatform(): MobilePlatform | null {
  const agent = navigator.userAgent
  const iPadAsDesktop = /Macintosh/.test(agent) && navigator.maxTouchPoints > 1
  if (/iPhone|iPad|iPod/.test(agent) || iPadAsDesktop) return 'ios'
  if (/Android/.test(agent)) return 'android'
  return null
}

export function preventIosFocusZoom(): void {
  if (detectMobilePlatform() !== 'ios') return
  const viewport = document.querySelector('meta[name="viewport"]')
  const content = viewport?.getAttribute('content') ?? ''
  if (viewport && !content.includes('maximum-scale')) {
    viewport.setAttribute('content', `${content}, maximum-scale=1`)
  }
}

export function isRunningAsApp(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    iosStandalone ||
    Capacitor.isNativePlatform()
  )
}
