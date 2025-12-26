import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { User } from '../types'
import { getAuthApi } from '../generated/api/client'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  getAccessToken: () => Promise<string | null>
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('erp_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const authApi = getAuthApi()
      const response = await authApi.v1ApiAuthLoginPost({ email, password })
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data
        
        if (userData && token) {
          const newUser: User = {
            id: String(userData.id || ''),
            email: userData.email || email,
            name: userData.fullName || email.split('@')[0],
          }
          
          setUser(newUser)
          localStorage.setItem('erp_user', JSON.stringify(newUser))
          localStorage.setItem('erp_token', token)
          localStorage.setItem('auth_token', token)
          
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('erp_user')
    localStorage.removeItem('erp_token')
    localStorage.removeItem('auth_token')
  }, [])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token')
    return token
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

