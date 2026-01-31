import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react'
import { authService } from '../services/api/authService'
import type { AuthUser, Company } from '../types/auth.types'

interface AuthContextType {
  user: AuthUser | null
  permissions: string[]
  companies: Company[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Storage keys for persisted auth data (non-sensitive info only)
const USER_STORAGE_KEY = 'erp_user'
const PERMISSIONS_STORAGE_KEY = 'erp_permissions'
const COMPANIES_STORAGE_KEY = 'erp_companies'
const TOKEN_EXPIRY_KEY = 'erp_token_expiry'

// Token refresh interval (refresh 2 minutes before expiry)
const REFRESH_BUFFER_MS = 2 * 60 * 1000

const parseStoredJson = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() =>
    parseStoredJson<AuthUser | null>(USER_STORAGE_KEY, null)
  )
  const [permissions, setPermissions] = useState<string[]>(() =>
    parseStoredJson<string[]>(PERMISSIONS_STORAGE_KEY, [])
  )
  const [companies, setCompanies] = useState<Company[]>(() =>
    parseStoredJson<Company[]>(COMPANIES_STORAGE_KEY, [])
  )
  const [isLoading, setIsLoading] = useState(true)

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAuthData = useCallback(() => {
    setUser(null)
    setPermissions([])
    setCompanies([])
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(PERMISSIONS_STORAGE_KEY)
    localStorage.removeItem(COMPANIES_STORAGE_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    // Clear legacy keys
    localStorage.removeItem('erp_token')
    localStorage.removeItem('auth_token')

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const saveAuthData = useCallback(
    (
      userData: AuthUser,
      userPermissions: string[],
      userCompanies: Company[],
      expiresIn?: string
    ) => {
      setUser(userData)
      setPermissions(userPermissions)
      setCompanies(userCompanies)

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(userPermissions))
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(userCompanies))

      // Calculate and store token expiry time
      if (expiresIn) {
        const expiryMs = parseExpiresIn(expiresIn)
        if (expiryMs > 0) {
          const expiryTime = Date.now() + expiryMs
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime))
          scheduleTokenRefresh(expiryMs)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const parseExpiresIn = (expiresIn: string): number => {
    // Parse strings like "1h", "30m", "24h"
    const match = expiresIn.match(/^(\d+)([hms])$/)
    if (!match) return 0

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case 'h':
        return value * 60 * 60 * 1000
      case 'm':
        return value * 60 * 1000
      case 's':
        return value * 1000
      default:
        return 0
    }
  }

  const scheduleTokenRefresh = useCallback(
    (expiryMs: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }

      // Schedule refresh before expiry
      const refreshTime = Math.max(expiryMs - REFRESH_BUFFER_MS, 0)

      if (refreshTime > 0) {
        refreshTimerRef.current = setTimeout(async () => {
          const success = await refreshToken()
          if (!success) {
            // Token refresh failed, log out
            clearAuthData()
          }
        }, refreshTime)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken()

      if (response.success && response.data) {
        const expiryMs = parseExpiresIn(response.data.expiresIn)
        if (expiryMs > 0) {
          const expiryTime = Date.now() + expiryMs
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime))
          scheduleTokenRefresh(expiryMs)
        }
        return true
      }

      return false
    } catch {
      return false
    }
  }, [scheduleTokenRefresh])

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await authService.login({ email, password })

        if (response.success && response.data) {
          const { user: userData, permissions: userPermissions, companies: userCompanies, expiresIn } = response.data

          saveAuthData(userData, userPermissions, userCompanies, expiresIn)

          return { success: true, message: response.message }
        }

        return { success: false, message: response.message || 'Login failed' }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed'
        return { success: false, message }
      }
    },
    [saveAuthData]
  )

  const logout = useCallback(async () => {
    // Call API to clear server-side session
    await authService.logout()

    // Clear local state
    clearAuthData()
  }, [clearAuthData])

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission)
    },
    [permissions]
  )

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      // If we have stored user data, verify the session is still valid
      const storedUser = parseStoredJson<AuthUser | null>(USER_STORAGE_KEY, null)

      if (storedUser) {
        try {
          const response = await authService.getCurrentUser()

          if (response.success && response.data) {
            const { user: userData, permissions: userPermissions, companies: userCompanies } = response.data
            saveAuthData(userData, userPermissions, userCompanies)

            // Check if we need to schedule refresh based on stored expiry
            const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
            if (storedExpiry) {
              const expiryTime = parseInt(storedExpiry, 10)
              const remainingMs = expiryTime - Date.now()
              if (remainingMs > 0) {
                scheduleTokenRefresh(remainingMs)
              } else {
                // Token might be expired, try to refresh
                const refreshed = await refreshToken()
                if (!refreshed) {
                  clearAuthData()
                }
              }
            }
          } else {
            // Session is invalid, clear stored data
            clearAuthData()
          }
        } catch {
          // API error, clear stored data
          clearAuthData()
        }
      }

      setIsLoading(false)
    }

    checkSession()

    // Cleanup timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        companies,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshToken,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
