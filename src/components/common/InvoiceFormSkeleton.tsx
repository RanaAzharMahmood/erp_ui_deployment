import React from 'react';
import { Box, Card, Grid, Skeleton, Divider } from '@mui/material';
import { COLORS } from '../../constants/colors';

/**
 * Skeleton loader component for Invoice/Return form pages.
 * Displays placeholder UI while data is being loaded in edit mode.
 */
const InvoiceFormSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={200} height={32} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Main Form */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, borderRadius: 2 }}>
            {/* Form Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ borderRadius: '8px' }}
              />
              <Skeleton variant="text" width={150} height={28} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Form Fields Grid */}
            <Grid container spacing={2.5}>
              {/* Row 1: Company & Invoice Number */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={100} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>

              {/* Row 2: Customer/Vendor & Date */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={110} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={50} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>

              {/* Row 3: Due Date & Payment Method */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={70} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>

              {/* Row 4: Remarks */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
            </Grid>

            {/* Line Items Table Skeleton */}
            <Box sx={{ mt: 3 }}>
              {/* Table Header */}
              <Skeleton
                variant="rounded"
                height={40}
                sx={{
                  bgcolor: '#1F2937',
                  borderRadius: '4px 4px 0 0',
                }}
              />

              {/* Table Rows */}
              {[1, 2, 3].map((row) => (
                <Box
                  key={row}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    py: 1.5,
                    px: 1,
                    borderBottom: `1px solid ${COLORS.border.default}`,
                    bgcolor: 'white',
                  }}
                >
                  <Skeleton variant="rounded" width="30%" height={36} />
                  <Skeleton variant="rounded" width="18%" height={36} />
                  <Skeleton variant="rounded" width="18%" height={36} />
                  <Skeleton variant="rounded" width="18%" height={36} />
                  <Skeleton variant="circular" width={36} height={36} />
                </Box>
              ))}
            </Box>

            {/* Add Line Item Button Skeleton */}
            <Skeleton
              variant="rounded"
              width={140}
              height={36}
              sx={{ mt: 2, borderRadius: 1 }}
            />

            {/* Summary Section */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Gross & Subtotal Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width={50} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={80} height={20} />
              </Box>

              {/* Tax Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="text" width={30} height={20} />
                <Skeleton variant="rounded" width={120} height={36} />
                <Skeleton variant="text" width={100} height={20} />
              </Box>

              {/* Paid Amount & Balance Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width={90} height={20} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="text" width={30} height={20} />
                  <Skeleton variant="rounded" width={100} height={36} />
                </Box>
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={80} height={20} />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Status Section */}
          <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ borderRadius: '8px' }}
              />
              <Skeleton variant="text" width={60} height={28} />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Status Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3].map((status) => (
                <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="text" width={80} height={20} />
                </Box>
              ))}
            </Box>
          </Card>

          {/* Download PDF Button Skeleton */}
          <Skeleton
            variant="rounded"
            height={48}
            sx={{
              mb: 3,
              borderRadius: 1,
              bgcolor: 'rgba(16, 185, 129, 0.2)',
            }}
          />

          {/* Action Buttons Skeleton */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton
              variant="rounded"
              height={48}
              sx={{ flex: 1, borderRadius: 1 }}
            />
            <Skeleton
              variant="rounded"
              height={48}
              sx={{
                flex: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255, 107, 53, 0.2)',
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceFormSkeleton;
