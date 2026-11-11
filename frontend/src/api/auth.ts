import { apiClient } from './client'
import type {
  AuthResponse,
  InviteTarget,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/features/auth/types'

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(
      '/auth/register',
      payload,
    )
    return data
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },

  async validateInvite(token: string): Promise<InviteTarget> {
    const { data } = await apiClient.get<InviteTarget>('/auth/invite', {
      params: { token },
    })
    return data
  },

  async setPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/set-password', { token, password })
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/change-password',
      { currentPassword, newPassword },
    )
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken })
  },
}
