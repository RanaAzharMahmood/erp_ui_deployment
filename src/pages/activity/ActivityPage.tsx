import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  TablePagination,
} from '@mui/material'
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  GridOn as GridOnIcon,
} from '@mui/icons-material'
import { exportToCsv } from '../../utils/csvExport'
import { useAuth } from '../../contexts/AuthContext'
import { useCompany } from '../../contexts/CompanyContext'
import { useCompanies, useDebounce } from '../../hooks'
import { COLORS } from '../../constants/colors'
import TableSkeleton from '../../components/common/TableSkeleton'
import PageError from '../../components/common/PageError'
import { getActivityLogsApi } from '../../generated/api/client'
import type { ActivityLog } from '../../generated/api/client'

const ActivityPage: React.FC = () => {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const isAdmin = user?.roleName?.toLowerCase() === 'admin'

  const { companies } = useCompanies()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState<string>('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Find companyId from selected company name (for admin filter)
  const selectedCompanyId = isAdmin && selectedCompanyFilter
    ? companies.find((c) => c.name === selectedCompanyFilter)?.id
    : undefined

  const loadActivities = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const api = getActivityLogsApi()
      const response = await api.getAll({
        companyId: selectedCompanyId,
        search: debouncedSearch || undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })

      if (response.data) {
        setActivities(response.data.data || [])
        setTotal(response.data.total || 0)
      }
    } catch (err) {
      console.error('Error loading activity logs:', err)
      setLoadError(err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCompanyId, debouncedSearch, rowsPerPage, page])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const handleSort = useCallback(
    (property: string) => {
      const isAsc = orderBy === property && order === 'asc'
      setOrder(isAsc ? 'desc' : 'asc')
      setOrderBy(property)
    },
    [orderBy, order]
  )

  // Client-side sort (API returns sorted by created_at DESC, but user can re-sort columns)
  const sortedActivities = [...activities].sort((a, b) => {
    let aValue: string = ''
    let bValue: string = ''
    switch (orderBy) {
      case 'userName':
        aValue = a.userName.toLowerCase()
        bValue = b.userName.toLowerCase()
        break
      case 'activity':
        aValue = a.description.toLowerCase()
        bValue = b.description.toLowerCase()
        break
      case 'time':
      case 'date':
        aValue = a.createdAt
        bValue = b.createdAt
        break
      default:
        return 0
    }
    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const handleExportCSV = useCallback(() => {
    const headers = ['User Name', 'Activity', 'Time', 'Date']
    const rows = activities.map((a) => {
      const d = new Date(a.createdAt)
      return [
        a.userName,
        a.description,
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      ]
    })
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'activity_log.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }, [activities])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const displayCompanyName = !isAdmin && selectedCompany ? selectedCompany.name : ''

  if (loadError) {
    return <PageError error={loadError} onRetry={loadActivities} />
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          gap: 2,
          border: '1px solid #E0E0E0',
          borderRadius: '12px',
          bgcolor: '#FFFFFF',
          px: 2,
          height: 70,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          {isAdmin ? (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedCompanyFilter}
                onChange={(e) => {
                  setSelectedCompanyFilter(e.target.value)
                  setPage(0)
                }}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    color: selectedCompanyFilter ? COLORS.primary : COLORS.text.secondary,
                    fontWeight: 600,
                  },
                }}
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.name}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {displayCompanyName}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <TextField
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportToCsv('activity-log', sortedActivities, [
              { header: 'User Name', value: 'userName' },
              { header: 'Description', value: 'description' },
              { header: 'Entity Type', value: 'entityType' },
              { header: 'Action', value: 'action' },
              { header: 'Company', value: 'companyName' },
              { header: 'Created At', value: 'createdAt' },
            ])}
            sx={{
              textTransform: 'none',
              borderColor: COLORS.success,
              color: COLORS.success,
              fontWeight: 500,
              '&:hover': {
                borderColor: COLORS.successHover,
                bgcolor: COLORS.successLight,
              },
            }}
          >
            Export to CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<GridOnIcon />}
            onClick={handleExportCSV}
            sx={{
              textTransform: 'none',
              borderColor: COLORS.success,
              color: COLORS.success,
              fontWeight: 500,
              '&:hover': {
                borderColor: COLORS.successHover,
                bgcolor: COLORS.successLight,
              },
            }}
          >
            Export To CSV
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table aria-label="Activity log">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', width: 80 }}>
                  Image
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'userName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'userName'}
                    direction={orderBy === 'userName' ? order : 'asc'}
                    onClick={() => handleSort('userName')}
                  >
                    User Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'activity' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'activity'}
                    direction={orderBy === 'activity' ? order : 'asc'}
                    onClick={() => handleSort('activity')}
                  >
                    Activity
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'time' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'time'}
                    direction={orderBy === 'time' ? order : 'asc'}
                    onClick={() => handleSort('time')}
                  >
                    Time
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'date' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : sortedActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No activity records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedActivities.map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Avatar
                        alt={record.userName}
                        sx={{ width: 40, height: 40, bgcolor: '#9E9E9E' }}
                      >
                        {record.userName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {record.userName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {record.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {formatTime(record.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {formatDate(record.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!isLoading && total > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #E0E0E0' }}
            aria-label="Activity table pagination"
          />
        )}
      </Box>
    </Box>
  )
}

export default ActivityPage
