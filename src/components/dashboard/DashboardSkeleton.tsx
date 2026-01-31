import React from 'react';
import { Box, Card, Grid, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { COLORS } from '../../constants/colors';

const KPI_COUNT = 6;

const KPICardSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, md: 2 },
        border: `1px solid ${COLORS.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Skeleton
        variant="rounded"
        width={isMobile ? 44 : 56}
        height={isMobile ? 44 : 56}
        sx={{ borderRadius: { xs: 1.5, md: 2 }, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="60%" height={isMobile ? 16 : 20} />
        <Skeleton variant="text" width="80%" height={isMobile ? 24 : 32} />
        <Skeleton variant="text" width="40%" height={isMobile ? 12 : 16} />
      </Box>
    </Card>
  );
};

const ChartSkeleton: React.FC<{ height?: { xs: number; sm: number; md: number } }> = ({ 
  height = { xs: 220, sm: 260, md: 300 } 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getHeight = () => {
    if (isMobile) return height.xs;
    if (isTablet) return height.sm;
    return height.md;
  };

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        height: '100%',
        border: `1px solid ${COLORS.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Skeleton 
        variant="text" 
        width="40%" 
        height={isMobile ? 20 : 28}
        sx={{ mb: { xs: 1, sm: 1.5, md: 2 } }} 
      />
      <Skeleton
        variant="rounded"
        width="100%"
        height={getHeight()}
        sx={{ borderRadius: 1 }}
      />
    </Card>
  );
};

const TableSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        height: '100%',
        border: `1px solid ${COLORS.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Skeleton 
        variant="text" 
        width="40%" 
        height={isMobile ? 20 : 28}
        sx={{ mb: { xs: 1, sm: 1.5, md: 2 } }} 
      />
      {Array.from({ length: isMobile ? 4 : 5 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5, md: 2 },
            py: { xs: 1, sm: 1.25, md: 1.5 },
            borderBottom: index < (isMobile ? 3 : 4) ? `1px solid ${COLORS.border.light}` : 'none',
          }}
        >
          <Skeleton variant="text" width="25%" height={isMobile ? 16 : 20} />
          <Skeleton variant="text" width="30%" height={isMobile ? 16 : 20} />
          <Skeleton variant="text" width="20%" height={isMobile ? 16 : 20} />
          <Skeleton variant="text" width="15%" height={isMobile ? 16 : 20} />
        </Box>
      ))}
    </Card>
  );
};

const DashboardSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
        <Skeleton variant="text" width={120} height={32} />
        <Skeleton variant="circular" width={isMobile ? 32 : 40} height={isMobile ? 32 : 40} />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {Array.from({ length: KPI_COUNT }).map((_, index) => (
          <Grid item xs={6} sm={6} md={4} key={index}>
            <KPICardSkeleton />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} lg={8}>
          <ChartSkeleton />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartSkeleton />
        </Grid>
      </Grid>

      {/* Charts Row 2 - Full Width */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12}>
          <ChartSkeleton height={{ xs: 180, sm: 220, md: 250 }} />
        </Grid>
      </Grid>

      {/* Tables Row */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ height: { xs: 320, sm: 360, md: 400 } }}>
            <TableSkeleton />
          </Box>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Box sx={{ height: { xs: 320, sm: 360, md: 400 } }}>
            <TableSkeleton />
          </Box>
        </Grid>
      </Grid>

      {/* Full Width Table */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ height: { xs: 360, sm: 400, md: 450 } }}>
            <TableSkeleton />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton;
