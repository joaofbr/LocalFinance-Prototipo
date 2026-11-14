export const QUICK_ENTRY_FOCUS = 'focusQuickEntry'

export function wantsQuickEntryFocus(state: unknown): boolean {
  return typeof state === 'object' && state !== null && QUICK_ENTRY_FOCUS in state
}
