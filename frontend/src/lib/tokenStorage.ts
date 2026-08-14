import { Preferences } from '@capacitor/preferences'

const TOKEN_KEY = 'lf.auth.token'
const REFRESH_KEY = 'lf.auth.refresh'

let cachedToken: string | null = null
let cachedRefresh: string | null = null

export const tokenStorage = {
  getCached(): string | null {
    return cachedToken
  },

  getCachedRefresh(): string | null {
    return cachedRefresh
  },

  async load(): Promise<string | null> {
    const [token, refresh] = await Promise.all([
      Preferences.get({ key: TOKEN_KEY }),
      Preferences.get({ key: REFRESH_KEY }),
    ])
    cachedToken = token.value
    cachedRefresh = refresh.value
    return token.value
  },

  async set(token: string, refreshToken: string): Promise<void> {
    cachedToken = token
    cachedRefresh = refreshToken
    await Promise.all([
      Preferences.set({ key: TOKEN_KEY, value: token }),
      Preferences.set({ key: REFRESH_KEY, value: refreshToken }),
    ])
  },

  async clear(): Promise<void> {
    cachedToken = null
    cachedRefresh = null
    await Promise.all([
      Preferences.remove({ key: TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_KEY }),
    ])
  },
}
