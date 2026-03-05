import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { Company } from '../types/auth.types'

interface CompanyContextType {
  selectedCompany: Company | null
  selectCompany: (company: Company) => void
  clearCompany: () => void
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

const STORAGE_KEY = 'erp_selected_company'

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { companies } = useAuth()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Validate stored company is still in user's companies list
  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const stillValid = companies.some((c) => c.id === selectedCompany.id)
      if (!stillValid) {
        setSelectedCompany(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [companies, selectedCompany])

  const selectCompany = useCallback((company: Company) => {
    setSelectedCompany(company)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company))
  }, [])

  const clearCompany = useCallback(() => {
    setSelectedCompany(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <CompanyContext.Provider value={{ selectedCompany, selectCompany, clearCompany }}>
      {children}
    </CompanyContext.Provider>
  )
}
