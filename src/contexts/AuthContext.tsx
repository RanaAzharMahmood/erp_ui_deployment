import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { User } from '../types'

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('erp_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - in production, this would be an actual API request
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simple validation - in production, this would be handled by backend
    if (email && password) {
      const newUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      }
      setUser(newUser)
      localStorage.setItem('erp_user', JSON.stringify(newUser))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('erp_user')
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

