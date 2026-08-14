import { Preferences } from '@capacitor/preferences'

const TOKEN_KEY = 'lf.auth.token'

let cachedToken: string | null = null

export const tokenStorage = {
  getCached(): string | null {
    return cachedToken
  },

  async load(): Promise<string | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEY })
    cachedToken = value
    return value
  },

  async set(token: string): Promise<void> {
    cachedToken = token
    await Preferences.set({ key: TOKEN_KEY, value: token })
  },

  async clear(): Promise<void> {
    cachedToken = null
    await Preferences.remove({ key: TOKEN_KEY })
  },
}
