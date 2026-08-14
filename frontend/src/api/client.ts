import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { env } from '@/lib/env'
import { tokenStorage } from '@/lib/tokenStorage'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getCached()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

let pendingRefresh: Promise<string | null> | null = null

async function requestNewToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getCachedRefresh()
  if (!refreshToken) return null

  try {
    const { data } = await refreshClient.post<{
      token: string
      refreshToken: string
    }>('/auth/refresh', { refreshToken })
    await tokenStorage.set(data.token, data.refreshToken)
    return data.token
  } catch {
    await tokenStorage.clear()
    return null
  }
}

function renewToken(): Promise<string | null> {
  pendingRefresh ??= requestNewToken().finally(() => {
    pendingRefresh = null
  })
  return pendingRefresh
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/set-password',
  '/auth/invite',
]

function isPublicAuthCall(url: string | undefined): boolean {
  return Boolean(url && PUBLIC_AUTH_PATHS.some((path) => url.includes(path)))
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const config = error.config as RetriableConfig | undefined

    if (status === 401 && isPublicAuthCall(config?.url)) {
      return Promise.reject(error)
    }

    if (status !== 401 || !config || config._retried) {
      if (status === 401) {
        onUnauthorized?.()
      }
      return Promise.reject(error)
    }

    const token = await renewToken()
    if (!token) {
      onUnauthorized?.()
      return Promise.reject(error)
    }

    config._retried = true
    config.headers.Authorization = `Bearer ${token}`
    return apiClient.request(config)
  },
)
