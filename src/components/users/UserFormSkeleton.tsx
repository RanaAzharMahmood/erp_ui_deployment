import React from 'react';
import { Box, Card, Grid, Skeleton, Divider } from '@mui/material';
import { COLORS } from '../../constants/colors';

/**
 * Skeleton loader for the User form pages
 * Matches the layout of AddUserPage and UpdateUserPage
 */
const UserFormSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={150} height={36} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* User Information Section */}
          <Card sx={{ p: 2.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={160} height={28} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              {/* First Name / Last Name */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* CNIC / Contact No */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={90} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Contact No 2 / Password */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={90} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={70} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Email */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={50} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* About User */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={90} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={80} />
              </Grid>
            </Grid>
          </Card>

          {/* Company Access Section */}
          <Card sx={{ p: 2.5, mt: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={200} height={28} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            {/* Company selector row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Skeleton variant="rounded" width="70%" height={40} />
              <Skeleton variant="rounded" width="25%" height={40} />
            </Box>
            {/* Company access cards placeholder */}
            <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={120} />
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* User Image Section */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={100} height={28} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Skeleton
                variant="circular"
                width={120}
                height={120}
                sx={{ mx: 'auto', mb: 2 }}
              />
              <Skeleton variant="text" width={100} height={16} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width={80} height={14} sx={{ mx: 'auto' }} />
            </Box>
          </Card>

          {/* Summary Section */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={80} height={28} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton
                variant="rounded"
                height={44}
                sx={{ bgcolor: 'rgba(255, 107, 53, 0.08)' }}
              />
              <Skeleton
                variant="rounded"
                height={44}
                sx={{ bgcolor: 'rgba(255, 107, 53, 0.08)' }}
              />
              <Skeleton
                variant="rounded"
                height={44}
                sx={{ bgcolor: 'rgba(255, 107, 53, 0.08)' }}
              />
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
              <Skeleton variant="rounded" width="50%" height={40} />
              <Skeleton variant="rounded" width="50%" height={40} />
            </Box>
          </Card>

          {/* Danger Zone Skeleton (for update page) */}
          <Card
            sx={{
              p: 2.5,
              mb: 3,
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

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width="50%" height={48} />
            <Skeleton variant="rounded" width="50%" height={48} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserFormSkeleton;
