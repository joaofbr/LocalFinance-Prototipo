const keyFor = (userId: string) => `lf.last-card.${userId}`

export function readLastCardId(userId: string): string {
  try {
    return localStorage.getItem(keyFor(userId)) ?? ''
  } catch {
    return ''
  }
}

export function rememberLastCardId(userId: string, cardId: string): void {
  try {
    if (cardId) localStorage.setItem(keyFor(userId), cardId)
    else localStorage.removeItem(keyFor(userId))
  } catch {
    return
  }
}
