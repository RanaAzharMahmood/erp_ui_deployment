import React, { useState, useMemo, useCallback } from 'react'
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

type ApprovalStatus = 'Pending' | 'Submit' | 'Reject'

interface ApprovalRecord {
  id: number
  userName: string
  imageUrl?: string
  activity: string
  status: ApprovalStatus
  time: string
  date: string
  companyId: number
  companyName: string
}

// Mock data for UI-only implementation
const MOCK_APPROVALS: ApprovalRecord[] = [
  { id: 1, userName: 'Harib Ansary', activity: 'Add sales invoice', status: 'Pending', time: '12:24 PM', date: 'Dec 31, 2025', companyId: 1, companyName: 'ERP Gas LTD' },
  { id: 2, userName: 'Harib Ansary', activity: 'Edit purchase invoice', status: 'Submit', time: '12:24 PM', date: 'Dec 31, 2025', companyId: 1, companyName: 'ERP Gas LTD' },
  { id: 3, userName: 'Harib Ansary', activity: 'Delete expense entry', status: 'Reject', time: '12:24 PM', date: 'Dec 31, 2025', companyId: 1, companyName: 'ERP Gas LTD' },
  { id: 4, userName: 'Harib Ansary', activity: 'Add sales invoice', status: 'Pending', time: '12:24 PM', date: 'Dec 31, 2025', companyId: 2, companyName: 'Tech Solutions' },
  { id: 5, userName: 'Harib Ansary', activity: 'Edit journal entry', status: 'Pending', time: '12:24 PM', date: 'Dec 31, 2025', companyId: 2, companyName: 'Tech Solutions' },
  { id: 6, userName: 'Harib Ansary', activity: 'Add bank deposit', status: 'Submit', time: '12:24 PM', date: 'Dec 31, 2025', companyId: 1, companyName: 'ERP Gas LTD' },
]

const ApprovalPage: React.FC = () => {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const isAdmin = user?.roleName?.toLowerCase() === 'admin'

  const { companies } = useCompanies()
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(MOCK_APPROVALS)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState<string>('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(searchTerm, 300)

  const handleSort = useCallback(
    (property: string) => {
      const isAsc = orderBy === property && order === 'asc'
      setOrder(isAsc ? 'desc' : 'asc')
      setOrderBy(property)
    },
    [orderBy, order]
  )

  const filteredApprovals = useMemo(() => {
    let filtered = approvals

    if (isAdmin && selectedCompanyFilter) {
      filtered = filtered.filter((a) => a.companyName === selectedCompanyFilter)
    }

    if (!isAdmin && selectedCompany) {
      filtered = filtered.filter((a) => a.companyId === selectedCompany.id)
    }

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.userName.toLowerCase().includes(search) ||
          a.activity.toLowerCase().includes(search)
      )
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue: string = ''
      let bValue: string = ''
      switch (orderBy) {
        case 'userName':
          aValue = a.userName.toLowerCase()
          bValue = b.userName.toLowerCase()
          break
        case 'activity':
          aValue = a.activity.toLowerCase()
          bValue = b.activity.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'time':
          aValue = a.time
          bValue = b.time
          break
        case 'date':
          aValue = a.date
          bValue = b.date
          break
        default:
          return 0
      }
      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [approvals, debouncedSearch, selectedCompanyFilter, isAdmin, selectedCompany, orderBy, order])

  const paginatedApprovals = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredApprovals.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredApprovals, page, rowsPerPage])

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const handleApprove = useCallback((id: number) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Submit' as ApprovalStatus } : a))
    )
  }, [])

  const handleReject = useCallback((id: number) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Reject' as ApprovalStatus } : a))
    )
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleExportCSV = useCallback(() => {
    const headers = ['User Name', 'Activity', 'Status', 'Time', 'Date']
    const rows = filteredApprovals.map((a) => [a.userName, a.activity, a.status, a.time, a.date])
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'approval_log.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }, [filteredApprovals])

  const displayCompanyName = !isAdmin && selectedCompany ? selectedCompany.name : ''

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
              {filteredApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No approval records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApprovals.map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Avatar
                        src={record.imageUrl}
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
                        {record.activity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status === 'Submit' ? 'Approved' : record.status === 'Reject' ? 'Rejected' : record.status}
                        size="small"
                        sx={{
                          ...getStatusChipStyles(record.status),
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {record.time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {record.date}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {record.status === 'Pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(record.id)}
                            sx={{ color: COLORS.success, mr: 0.5 }}
                            aria-label={`Approve ${record.userName}'s request`}
                          >
                            <CheckCircleIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleReject(record.id)}
                            sx={{ color: COLORS.error }}
                            aria-label={`Reject ${record.userName}'s request`}
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

        {filteredApprovals.length > 0 && (
          <TablePagination
            component="div"
            count={filteredApprovals.length}
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
    </Box>
  )
}

export default ApprovalPage
