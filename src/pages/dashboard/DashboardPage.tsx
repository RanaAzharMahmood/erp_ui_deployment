import React from 'react';
import { Box, Grid, Typography, Alert, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentsIcon from '@mui/icons-material/Payments';
import { DASHBOARD_COLORS, COLORS } from '../../constants/colors';
import { KPICard, DashboardSkeleton } from '../../components/dashboard';
import {
  SalesVsPurchasesChart,
  SalesByProductChart,
  InventoryTrendChart,
} from '../../components/dashboard/charts';
import {
  LowStockTable,
  OverdueInvoicesTable,
  LatestTransactionsTable,
} from '../../components/dashboard/tables';
import useDashboardData from '../../hooks/queries/useDashboardData';

const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refresh } = useDashboardData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert
          severity="error"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={refresh}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const kpiCards = [
    {
      title: "Today's Sales",
      value: data.summary.todaysSales,
      icon: <TrendingUpIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.sales,
      iconColor: DASHBOARD_COLORS.kpiIcons.sales,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Today's Purchase",
      value: data.summary.todaysPurchase,
      icon: <ShoppingCartIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.purchase,
      iconColor: DASHBOARD_COLORS.kpiIcons.purchase,
      trend: { value: 8.3, isPositive: true },
    },
    {
      title: 'Profit/Loss',
      value: data.summary.profitLoss,
      icon: <AccountBalanceWalletIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.profit,
      iconColor: DASHBOARD_COLORS.kpiIcons.profit,
      trend: { value: 15.2, isPositive: true },
    },
    {
      title: 'Stock Value',
      value: data.summary.stockValue,
      icon: <InventoryIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.stock,
      iconColor: DASHBOARD_COLORS.kpiIcons.stock,
    },
    {
      title: 'Receivable',
      value: data.summary.receivable,
      icon: <ReceiptIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.receivable,
      iconColor: DASHBOARD_COLORS.kpiIcons.receivable,
      trend: { value: 5.7, isPositive: false },
    },
    {
      title: 'Payable',
      value: data.summary.payable,
      icon: <PaymentsIcon />,
      backgroundColor: DASHBOARD_COLORS.kpiBackgrounds.payable,
      iconColor: DASHBOARD_COLORS.kpiIcons.payable,
      trend: { value: 3.2, isPositive: false },
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: COLORS.text.primary,
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton
            onClick={refresh}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: COLORS.text.secondary,
              '&:hover': {
                color: COLORS.primary,
                backgroundColor: 'rgba(255, 107, 53, 0.08)',
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Cards - 2 cols on mobile, 2 on tablet, 3 on desktop */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={6} sm={6} md={4} key={index}>
            <KPICard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              backgroundColor={kpi.backgroundColor}
              iconColor={kpi.iconColor}
              trend={kpi.trend}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row 1: Sales vs Purchases + Sales by Product */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} lg={8}>
          <SalesVsPurchasesChart data={data.salesVsPurchases} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <SalesByProductChart data={data.salesByProduct} />
        </Grid>
      </Grid>

      {/* Charts Row 2: Inventory Trend (full width) */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12}>
          <InventoryTrendChart data={data.inventoryTrend} />
        </Grid>
      </Grid>

      {/* Tables Row: Low Stock + Overdue Invoices */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ height: { xs: 320, sm: 360, md: 400 } }}>
            <LowStockTable data={data.lowStockItems} />
          </Box>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Box sx={{ height: { xs: 320, sm: 360, md: 400 } }}>
            <OverdueInvoicesTable data={data.overdueInvoices} />
          </Box>
        </Grid>
      </Grid>

      {/* Latest Transactions (full width) */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ height: { xs: 360, sm: 400, md: 450 } }}>
            <LatestTransactionsTable data={data.latestTransactions} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
