import React from 'react';
import { Box, Card, Grid, Skeleton, Divider } from '@mui/material';
import { COLORS } from '../../constants/colors';

/**
 * Skeleton loader for the Company form pages
 * Matches the layout of AddCompanyPage and UpdateCompanyPage
 */
const CompanyFormSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={150} height={36} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Company Information Section */}
          <Card sx={{ p: 2.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={180} height={28} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              {/* Company Name / NTN Number */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={110} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={90} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Website / Industry */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Sales Tax Number / Company Email */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={120} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={110} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Address */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={100} />
              </Grid>
            </Grid>
          </Card>

          {/* Primary Contact Section */}
          <Card sx={{ p: 2.5, mt: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={140} height={28} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              {/* Contact Name / Contact Email */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Contact Phone */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={150} height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Company Logo Section */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={120} height={28} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Skeleton
                variant="rounded"
                width={150}
                height={150}
                sx={{ mx: 'auto', mb: 2, borderRadius: 2 }}
              />
              <Skeleton variant="text" width={100} height={16} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width={80} height={14} sx={{ mx: 'auto' }} />
            </Box>
          </Card>

          {/* Status Section */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={60} height={28} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rounded" width="33%" height={40} />
              <Skeleton variant="rounded" width="33%" height={40} />
              <Skeleton variant="rounded" width="33%" height={40} />
            </Box>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Skeleton variant="rounded" width="50%" height={48} />
            <Skeleton variant="rounded" width="50%" height={48} />
          </Box>

          {/* Danger Zone Skeleton (for update page) */}
          <Card
            sx={{
              p: 2.5,
              border: `1px solid ${COLORS.border.default}`,
              boxShadow: 'none',
              bgcolor: 'rgba(239, 68, 68, 0.02)',
            }}
          >
            <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={16} sx={{ mb: 2 }} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyFormSkeleton;
