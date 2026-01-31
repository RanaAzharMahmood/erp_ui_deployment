/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import type {
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  CurrentUserResponse,
} from '../../types/auth.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
})

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || 'Login failed',
      }
    }

    return data
  },

  /**
   * Logout current user
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/api/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      })

      const data = await response.json()

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Logged out successfully' : 'Logout failed'),
      }
    } catch {
      // Even if the API call fails, we should still clear local state
      return {
        success: true,
        message: 'Logged out locally',
      }
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<RefreshResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/auth/refresh`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || 'Token refresh failed',
      }
    }

    return data
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || 'Failed to get user profile',
      }
    }

    return data
  },
}

export default authService
