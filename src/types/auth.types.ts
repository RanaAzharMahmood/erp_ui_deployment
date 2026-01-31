/**
 * Authentication Types
 */

export interface AuthUser {
  id: number
  fullName: string
  email: string
  roleId: number
  roleName: string
  isActive?: boolean
}

export interface Company {
  id: number
  name: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: AuthUser
    permissions: string[]
    companies: Company[]
    token: string
    expiresIn: string
  }
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export interface RefreshResponse {
  success: boolean
  message: string
  data?: {
    token: string
    expiresIn: string
  }
}

export interface CurrentUserResponse {
  success: boolean
  message: string
  data?: {
    user: AuthUser
    permissions: string[]
    companies: Company[]
  }
}

export interface AuthError {
  success: false
  message: string
  error?: string
}

export interface AuthState {
  user: AuthUser | null
  permissions: string[]
  companies: Company[]
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}
