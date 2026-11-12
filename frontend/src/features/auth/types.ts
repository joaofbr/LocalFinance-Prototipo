type UserRole = 'Admin' | 'Member'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  developer: boolean
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
  refreshToken: string
}

export interface RegisterResponse {
  pendingApproval: boolean
  session: AuthResponse | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface InviteTarget {
  name: string
  email: string
  isInvite: boolean
  invitedByName: string | null
  invitedByEmail: string | null
}
