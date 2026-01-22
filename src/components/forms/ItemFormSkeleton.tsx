import React from 'react';
import { Box, Card, Grid, Skeleton, Divider } from '@mui/material';

/**
 * Skeleton loader for the Item form
 * Matches the layout of ItemFormFields and ItemFormActions components
 * Used while loading item data in edit mode
 */
const ItemFormSkeleton: React.FC = () => {
  // Helper to render a skeleton field (label + input)
  const SkeletonField = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6}>
      <Skeleton variant="text" width={100} height={20} sx={{ mb: 0.5 }} />
      <Skeleton
        variant="rounded"
        height={40}
        animation="wave"
        sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
      />
    </Grid>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={150} height={36} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Item Details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, borderRadius: 2 }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ borderRadius: '8px' }}
              />
              <Skeleton variant="text" width={120} height={28} />
            </Box>
            <Divider sx={{ mb: 3, mt: -1 }} />

            <Grid container spacing={2.5}>
              {/* Row 1: Item Id, Item Hash Code */}
              <SkeletonField />
              <SkeletonField />

              {/* Row 2: Item Name, Category */}
              <SkeletonField />
              <SkeletonField />

              {/* Row 3: Unit Price, Purchase Price */}
              <SkeletonField />
              <SkeletonField />

              {/* Row 4: Sales Price, Measuring Units */}
              <SkeletonField />
              <SkeletonField />

              {/* Row 5: Open Stocks, Close Stocks */}
              <SkeletonField />
              <SkeletonField />

              {/* Row 6: Company */}
              <SkeletonField />
              <Grid item xs={12} sm={6} /> {/* Empty space */}

              {/* Description (full width) */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={100} height={20} sx={{ mb: 0.5 }} />
                <Skeleton
                  variant="rounded"
                  height={100}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column - Status & Actions */}
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
              <Skeleton variant="text" width={80} height={28} />
            </Box>
            <Divider sx={{ mb: 2, mt: -1 }} />
            {/* Status options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={44}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
                />
              ))}
            </Box>
          </Card>

          {/* Danger Zone Skeleton */}
          <Card sx={{ p: 3, borderRadius: 2, mb: 3, border: '1px solid #FEE2E2' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ borderRadius: '8px' }}
              />
              <Skeleton variant="text" width={100} height={28} />
            </Box>
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              animation="wave"
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
            />
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton
              variant="rounded"
              height={48}
              animation="wave"
              sx={{ flex: 1, bgcolor: 'rgba(0, 0, 0, 0.06)' }}
            />
            <Skeleton
              variant="rounded"
              height={48}
              animation="wave"
              sx={{ flex: 1, bgcolor: 'rgba(0, 0, 0, 0.06)' }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ItemFormSkeleton;
