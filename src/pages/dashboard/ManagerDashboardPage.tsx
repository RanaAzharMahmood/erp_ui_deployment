import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PaymentsIcon from '@mui/icons-material/Payments'
import { DASHBOARD_COLORS, COLORS } from '../../constants/colors'
import { KPICard, DashboardSkeleton } from '../../components/dashboard'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useCompany } from '../../contexts/CompanyContext'
import useManagerDashboardData from '../../hooks/queries/useManagerDashboardData'
import { getApprovalRequestsApi } from '../../generated/api/client'
import type { ApprovalRequest } from '../../generated/api/client'

const REQUEST_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']

const ManagerDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { selectedCompany } = useCompany()
  const { data, isLoading, error, refresh } = useManagerDashboardData()
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([])

  useEffect(() => {
    if (!selectedCompany) return;
    getApprovalRequestsApi().getAll({ status: 'pending', limit: 5 })
      .then((res) => setPendingRequests(res.data?.data || []))
      .catch(() => { /* silently ignore */ })
  }, [selectedCompany])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={refresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    )
  }

  if (!data) {
    return null
  }

  const kpiCards = [
    {
      title: "Today's Sale",
      value: data.summary.todaysSales,
      icon: <TrendingUpIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.sales,
      iconColor: DASHBOARD_COLORS.kpiIcons.sales,
    },
    {
      title: "Today's Purchase",
      value: data.summary.todaysPurchase,
      icon: <ShoppingCartIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.purchase,
      iconColor: DASHBOARD_COLORS.kpiIcons.purchase,
    },
    {
      title: 'Profit/Loss',
      value: data.summary.profitLoss,
      icon: <AccountBalanceWalletIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.profit,
      iconColor: DASHBOARD_COLORS.kpiIcons.profit,
    },
    {
      title: 'Total Stock Value',
      value: data.summary.stockValue,
      icon: <InventoryIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.stock,
      iconColor: DASHBOARD_COLORS.kpiIcons.stock,
    },
    {
      title: 'Outstanding Receivable',
      value: data.summary.receivable,
      icon: <ReceiptIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.receivable,
      iconColor: DASHBOARD_COLORS.kpiIcons.receivable,
    },
    {
      title: 'Outstanding Payable',
      value: data.summary.payable,
      icon: <PaymentsIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.payable,
      iconColor: DASHBOARD_COLORS.kpiIcons.payable,
    },
  ]

  const overdueInvoices = data.overdueInvoices
  const latestSales = data.latestTransactions.filter((t) => t.type === 'Sale')

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Company Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: COLORS.text.primary, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {selectedCompany?.name || 'Dashboard'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.text.muted, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: 160, sm: 240 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.875rem',
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/users/add')}
            sx={{
              bgcolor: '#FF6B35',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: '#E55A2B' },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            Add Users
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={refresh} size="small" sx={{ color: COLORS.text.secondary }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPI Cards - 2 rows of 3 */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={6} sm={4} key={index}>
            <KPICard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              backgroundColor={kpi.backgroundColor}
              iconColor={kpi.iconColor}
            />
          </Grid>
        ))}
      </Grid>

      {/* Two-column: User Requests + Overdue Invoices */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        {/* User Requests - placeholder */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: 360,
              border: `1px solid ${COLORS.border.default}`,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${COLORS.border.default}`,
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.text.primary, fontWeight: 600, fontSize: '1rem' }}>
                User Requests
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
              {pendingRequests.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" sx={{ color: COLORS.text.muted }}>
                    No pending requests
                  </Typography>
                </Box>
              ) : (
                pendingRequests.map((req, idx) => (
                  <Box
                    key={req.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      mb: 1,
                      borderRadius: '8px',
                      bgcolor: '#FFFBF5',
                      borderLeft: `4px solid ${REQUEST_COLORS[idx % REQUEST_COLORS.length]}`,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
                        Permission for {req.action} {(req.entityType || '').replace(/_/g, ' ')}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: COLORS.text.muted }}>
                        {req.requesterName}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => navigate('/approval')}
                      sx={{ bgcolor: COLORS.primary, color: '#fff', width: 28, height: 28, '&:hover': { bgcolor: COLORS.primaryHover } }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

        {/* Overdue Invoices */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              height: 360,
              border: `1px solid ${COLORS.border.default}`,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${COLORS.border.default}`,
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.text.primary, fontWeight: 600, fontSize: '1rem' }}>
                Overdue Invoices
              </Typography>
            </Box>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Customer', 'Invoice #', 'Amount', 'Due Date', 'Status'].map((header) => (
                      <TableCell
                        key={header}
                        align={header === 'Amount' ? 'right' : 'left'}
                        sx={{
                          bgcolor: COLORS.table.headerBg,
                          color: COLORS.text.secondary,
                          fontWeight: 600,
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id} sx={{ '&:hover': { bgcolor: COLORS.table.rowHover } }}>
                      <TableCell sx={{ fontSize: 13 }}>{invoice.customerName}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: COLORS.text.secondary }}>
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 500 }}>
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: COLORS.text.secondary }}>
                        {formatDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${invoice.daysOverdue} Days overdue`}
                          size="small"
                          sx={{
                            bgcolor: COLORS.errorLight,
                            color: COLORS.error,
                            border: `1px solid ${COLORS.error}`,
                            fontWeight: 500,
                            fontSize: 11,
                            height: 24,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {overdueInvoices.length === 0 && (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: COLORS.text.muted }}>
                  No overdue invoices
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Latest Sales Table */}
      <Card
        sx={{
          border: `1px solid ${COLORS.border.default}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${COLORS.border.default}`,
          }}
        >
          <Typography variant="h6" sx={{ color: COLORS.text.primary, fontWeight: 600, fontSize: '1rem' }}>
            Latest Sales
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['Sales ID', 'Customer', 'Date', 'Amount', 'Status'].map((header) => (
                  <TableCell
                    key={header}
                    align={header === 'Amount' ? 'right' : 'left'}
                    sx={{
                      bgcolor: COLORS.table.headerBg,
                      color: COLORS.text.secondary,
                      fontWeight: 600,
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {latestSales.map((sale) => (
                <TableRow key={sale.id} sx={{ '&:hover': { bgcolor: COLORS.table.rowHover } }}>
                  <TableCell sx={{ fontSize: 13, color: COLORS.text.secondary }}>
                    {sale.transactionId}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{sale.customerName}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: COLORS.text.secondary }}>
                    {formatDate(sale.date)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 500 }}>
                    {formatCurrency(sale.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.status}
                      size="small"
                      sx={{
                        bgcolor:
                          sale.status === 'Completed'
                            ? COLORS.successLight
                            : COLORS.warningLight,
                        color:
                          sale.status === 'Completed'
                            ? COLORS.success
                            : COLORS.warning,
                        border: `1px solid ${sale.status === 'Completed' ? COLORS.success : COLORS.warning}`,
                        fontWeight: 500,
                        fontSize: 11,
                        height: 24,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {latestSales.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: COLORS.text.muted }}>
              No recent sales
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default ManagerDashboardPage
