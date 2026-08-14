import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { setUnauthorizedHandler } from '@/api/client'
import { isUnauthorizedError } from '@/lib/apiError'
import { tokenStorage } from '@/lib/tokenStorage'
import type { LoginRequest, RegisterRequest, User } from './types'

type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [user, setUser] = useState<User | null>(null)

  const logout = useCallback(() => {
    const refreshToken = tokenStorage.getCachedRefresh()
    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined)
    }
    void tokenStorage.clear()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    let cancelled = false
    void (async () => {
      const token = await tokenStorage.load()
      if (!token) {
        if (!cancelled) setStatus('unauthenticated')
        return
      }
      try {
        const current = await authApi.me()
        if (cancelled) return
        setUser(current)
        setStatus('authenticated')
      } catch (error) {
        if (cancelled) return
        if (isUnauthorizedError(error)) {
          await tokenStorage.clear()
        }
        setUser(null)
        setStatus('unauthenticated')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(async (payload: LoginRequest) => {
    const result = await authApi.login(payload)
    await tokenStorage.set(result.token, result.refreshToken)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    const result = await authApi.register(payload)
    await tokenStorage.set(result.token, result.refreshToken)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
