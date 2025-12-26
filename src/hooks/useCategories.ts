import { useState, useEffect } from 'react'
import { Category } from '../types'

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadCategories = () => {
      const stored = localStorage.getItem('erp_categories')
      setCategories(stored ? JSON.parse(stored) : [])
    }

    loadCategories()
    // Listen for storage changes to sync across tabs
    window.addEventListener('storage', loadCategories)
    
    // Custom event for same-tab updates
    const handleStorageChange = () => loadCategories()
    window.addEventListener('categoriesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', loadCategories)
      window.removeEventListener('categoriesUpdated', handleStorageChange)
    }
  }, [])

  return { categories }
}

