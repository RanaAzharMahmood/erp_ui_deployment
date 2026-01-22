import React from 'react';
import { Box, Card, Grid, Skeleton } from '@mui/material';

interface PartyFormSkeletonProps {
  /** Whether this is for update mode (shows danger zone) */
  showDangerZone?: boolean;
}

/**
 * Skeleton loader for Party form pages (Add/Update)
 * Matches the layout of PartyDetailsSection, ContactDetailsSection, and CompanyStatusSection
 */
const PartyFormSkeleton: React.FC<PartyFormSkeletonProps> = ({ showDangerZone = true }) => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Skeleton variant="text" width={150} height={36} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Party Details Section */}
          <Card sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={120} height={28} />
            </Box>
            <Skeleton variant="rectangular" height={1} sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              {/* Party Name */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={90} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Party Type */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* NTN Number */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={100} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Tax Office */}
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Sales Tax Number - Full Width */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={130} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={40} />
              </Grid>
              {/* Address - Full Width Multiline */}
              <Grid item xs={12}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rounded" height={100} />
              </Grid>
            </Grid>
          </Card>

          {/* Contact Details Section */}
          <Box sx={{ mt: 3 }}>
            <Card sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              {/* Section Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="text" width={140} height={28} />
              </Box>
              <Skeleton variant="rectangular" height={1} sx={{ mb: 3 }} />

              <Grid container spacing={2.5}>
                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width={50} height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rounded" height={40} />
                </Grid>
                {/* CNIC */}
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width={50} height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rounded" height={40} />
                </Grid>
                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width={50} height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rounded" height={40} />
                </Grid>
                {/* Contact Number */}
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width={110} height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rounded" height={40} />
                </Grid>
                {/* Principal Activity */}
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rounded" height={40} />
                </Grid>
                {/* Select Company (shown in update mode) */}
                {showDangerZone && (
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="text" width={110} height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="rounded" height={40} />
                  </Grid>
                )}
              </Grid>
            </Card>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Company Selection Card */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={60} height={24} />
            </Box>
            <Skeleton variant="rectangular" height={1} sx={{ mb: 2 }} />
            {/* Company Selector */}
            <Skeleton variant="text" width={110} height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
            {/* Add Company Button */}
            <Skeleton variant="rounded" width={130} height={36} />
          </Card>

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

          {/* Danger Zone (for Update page only) */}
          {showDangerZone && (
            <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="text" width={100} height={24} />
              </Box>
              <Skeleton variant="rectangular" height={1} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={40} />
            </Card>
          )}

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

export default PartyFormSkeleton;
