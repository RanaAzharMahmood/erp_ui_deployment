import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { User } from '../types'
import { getAuthApi } from '../generated/api/client'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
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

// Storage key for user data (non-sensitive info only)
const USER_STORAGE_KEY = 'erp_user'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Only store non-sensitive user info in localStorage
    // Token is stored in httpOnly cookie by the server
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const authApi = getAuthApi()
      const response = await authApi.v1ApiAuthLoginPost({ email, password })

      if (response.success && response.data) {
        const { user: userData } = response.data

        if (userData) {
          // Only store non-sensitive user info
          // Token is automatically stored as httpOnly cookie by the server
          const newUser: User = {
            id: String(userData.id || ''),
            email: userData.email || email,
            name: userData.fullName || email.split('@')[0],
          }

          setUser(newUser)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))

          // Clear any legacy token storage (migration cleanup)
          localStorage.removeItem('erp_token')
          localStorage.removeItem('auth_token')

          return true
        }
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie on server
      const authApi = getAuthApi()
      await authApi.v1ApiAuthLogoutPost()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state regardless of server response
      setUser(null)
      localStorage.removeItem(USER_STORAGE_KEY)
      // Clear any legacy token storage
      localStorage.removeItem('erp_token')
      localStorage.removeItem('auth_token')
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

