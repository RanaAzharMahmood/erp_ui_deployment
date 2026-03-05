import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '../../types/dashboard.types'
import { getAllDashboardData } from '../../services/domain/dashboardService'
import { useCompany } from '../../contexts/CompanyContext'

interface UseManagerDashboardDataReturn {
  data: DashboardData | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

const useManagerDashboardData = (): UseManagerDashboardDataReturn => {
  const { selectedCompany } = useCompany()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!selectedCompany) {
      setData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const dashboardData = await getAllDashboardData(selectedCompany.id)
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'))
    } finally {
      setIsLoading(false)
    }
  }, [selectedCompany])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return { data, isLoading, error, refresh }
}

export default useManagerDashboardData
