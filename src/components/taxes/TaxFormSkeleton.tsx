import React from 'react';
import { Box, Card, Grid, Skeleton } from '@mui/material';

/**
 * Skeleton loader for Tax form pages (Add/Update)
 * Matches the layout of TaxForm component with Status and Action sections
 */
const TaxFormSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Skeleton variant="text" width={150} height={36} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Tax Details Form */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={100} height={28} />
            </Box>
            <Skeleton variant="rectangular" height={1} sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              {/* Tax Id */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Tax Name */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Tax %age */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={70} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Tax Date */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={70} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Note - Full Width */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={40} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column - Status and Actions */}
        <Grid item xs={12} lg={4}>
          {/* Status Section */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={60} height={24} />
            </Box>
            <Skeleton variant="rectangular" height={1} sx={{ mb: 2 }} />
            {/* Status Options */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: '18px' }} />
              <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: '18px' }} />
            </Box>
          </Card>

          {/* Danger Zone (for Update page) */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={100} height={24} />
            </Box>
            <Skeleton variant="rectangular" height={1} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={40} />
          </Card>

          {/* Action Buttons */}
          <Card sx={{ p: 2.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Skeleton variant="rounded" height={45} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={45} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxFormSkeleton;
