import { AxiosError } from 'axios'

interface ProblemDetails {
  title?: string
  detail?: string
  message?: string
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }
    const data = error.response.data as ProblemDetails | undefined
    return data?.detail ?? data?.message ?? data?.title ?? fallback
  }
  return fallback
}
