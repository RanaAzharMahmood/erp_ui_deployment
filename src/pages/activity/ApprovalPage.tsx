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
  Chip,
  IconButton,
  TablePagination,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Search as SearchIcon,
  Print as PrintIcon,
  GridOn as GridOnIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useCompany } from '../../contexts/CompanyContext'
import { useCompanies, useDebounce } from '../../hooks'
import { COLORS, getStatusChipStyles } from '../../constants/colors'
import TableSkeleton from '../../components/common/TableSkeleton'
import PageError from '../../components/common/PageError'
import { getApprovalRequestsApi } from '../../generated/api/client'
import type { ApprovalRequest } from '../../generated/api/client'

type ChipStatus = 'Pending' | 'Submit' | 'Reject'

const mapStatusToChip = (status: string): ChipStatus => {
  switch (status) {
    case 'approved': return 'Submit'
    case 'rejected': return 'Reject'
    default: return 'Pending'
  }
}

const mapStatusLabel = (status: string): string => {
  switch (status) {
    case 'approved': return 'Approved'
    case 'rejected': return 'Rejected'
    default: return 'Pending'
  }
}

const ApprovalPage: React.FC = () => {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const isAdmin = user?.roleName?.toLowerCase() === 'admin'

  const { companies } = useCompanies()
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState<string>('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const debouncedSearch = useDebounce(searchTerm, 300)

  const selectedCompanyId = isAdmin && selectedCompanyFilter
    ? companies.find((c) => c.name === selectedCompanyFilter)?.id
    : undefined

  const loadApprovals = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const api = getApprovalRequestsApi()
      const response = await api.getAll({
        companyId: selectedCompanyId,
        search: debouncedSearch || undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })

      if (response.data) {
        setApprovals(response.data.data || [])
        setTotal(response.data.total || 0)
      }
    } catch (err) {
      console.error('Error loading approval requests:', err)
      setLoadError(err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCompanyId, debouncedSearch, rowsPerPage, page])

  useEffect(() => {
    loadApprovals()
  }, [loadApprovals])

  const handleSort = useCallback(
    (property: string) => {
      const isAsc = orderBy === property && order === 'asc'
      setOrder(isAsc ? 'desc' : 'asc')
      setOrderBy(property)
    },
    [orderBy, order]
  )

  const sortedApprovals = [...approvals].sort((a, b) => {
    let aValue: string = ''
    let bValue: string = ''
    switch (orderBy) {
      case 'userName':
        aValue = a.requesterName.toLowerCase()
        bValue = b.requesterName.toLowerCase()
        break
      case 'activity':
        aValue = `${a.action} ${a.entityType || ''}`.toLowerCase()
        bValue = `${b.action} ${b.entityType || ''}`.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
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

  const handleApprove = useCallback(async (id: number) => {
    try {
      const api = getApprovalRequestsApi()
      await api.approve(id)
      setSuccessMessage('Request approved and action executed successfully')
      loadApprovals()
    } catch (err) {
      console.error('Error approving request:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Failed to approve request')
    }
  }, [loadApprovals])

  const handleReject = useCallback(async (id: number) => {
    try {
      const api = getApprovalRequestsApi()
      await api.reject(id)
      setSuccessMessage('Request rejected successfully')
      loadApprovals()
    } catch (err) {
      console.error('Error rejecting request:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reject request')
    }
  }, [loadApprovals])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleExportCSV = useCallback(() => {
    const headers = ['User Name', 'Activity', 'Status', 'Time', 'Date']
    const rows = approvals.map((a) => {
      const d = new Date(a.createdAt)
      return [
        a.requesterName,
        `${a.action} ${(a.entityType || '').replace(/_/g, ' ')}`,
        mapStatusLabel(a.status),
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      ]
    })
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'approval_log.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }, [approvals])

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
    return <PageError error={loadError} onRetry={loadApprovals} />
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
            startIcon={<PrintIcon />}
            onClick={handlePrint}
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
            Print List
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
          <Table aria-label="Approval list">
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
                  aria-sort={orderBy === 'status' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
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
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : sortedApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No approval records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedApprovals.map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Avatar
                        alt={record.requesterName}
                        sx={{ width: 40, height: 40, bgcolor: '#9E9E9E' }}
                      >
                        {record.requesterName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {record.requesterName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {record.action} {(record.entityType || '').replace(/_/g, ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mapStatusLabel(record.status)}
                        size="small"
                        sx={{
                          ...getStatusChipStyles(mapStatusToChip(record.status)),
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
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
                    <TableCell align="right">
                      {record.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(record.id)}
                            sx={{ color: COLORS.success, mr: 0.5 }}
                            aria-label={`Approve ${record.requesterName}'s request`}
                          >
                            <CheckCircleIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleReject(record.id)}
                            sx={{ color: COLORS.error }}
                            aria-label={`Reject ${record.requesterName}'s request`}
                          >
                            <CancelIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                        </>
                      )}
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
            aria-label="Approval table pagination"
          />
        )}
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ApprovalPage
