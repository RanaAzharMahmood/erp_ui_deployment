import React from 'react';
import { Box, Card, Skeleton, Grid } from '@mui/material';

interface FormSkeletonProps {
  /**
   * Number of form fields in the first card
   * @default 5
   */
  firstCardFields?: number;

  /**
   * Number of form fields in the second card
   * @default 5
   */
  secondCardFields?: number;

  /**
   * Whether to show the danger zone card (for edit/update pages)
   * @default false
   */
  showDangerZone?: boolean;
}

/**
 * Form skeleton loader for better loading UX
 * Shows animated skeleton that matches the Customer/Vendor form layout
 * with two-column structure (left: form cards, right: status/actions)
 *
 * @example
 * if (isLoading) {
 *   return <FormSkeleton showDangerZone />;
 * }
 */
const FormSkeleton: React.FC<FormSkeletonProps> = ({
  firstCardFields = 5,
  secondCardFields = 5,
  showDangerZone = false,
}) => {
  const iconBoxStyle = {
    width: 40,
    height: 40,
    borderRadius: '8px',
    bgcolor: 'rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const renderFormFields = (count: number) => {
    const rows: React.ReactNode[] = [];
    let remaining = count;
    let key = 0;

    while (remaining > 0) {
      if (remaining >= 2) {
        // Two fields in a row
        rows.push(
          <React.Fragment key={key}>
            <Grid item xs={12} sm={6}>
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ mb: 0.5 }}
                animation="wave"
              />
              <Skeleton
                variant="rounded"
                height={40}
                animation="wave"
                sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton
                variant="text"
                width={100}
                height={20}
                sx={{ mb: 0.5 }}
                animation="wave"
              />
              <Skeleton
                variant="rounded"
                height={40}
                animation="wave"
                sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
              />
            </Grid>
          </React.Fragment>
        );
        remaining -= 2;
        key++;
      } else {
        // Single field spanning full width
        rows.push(
          <Grid item xs={12} key={`full-${key}`}>
            <Skeleton
              variant="text"
              width={120}
              height={20}
              sx={{ mb: 0.5 }}
              animation="wave"
            />
            <Skeleton
              variant="rounded"
              height={remaining === 1 ? 40 : 100}
              animation="wave"
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
            />
          </Grid>
        );
        remaining -= 1;
      }
    }

    return rows;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          animation="wave"
          sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
        />
        <Skeleton
          variant="text"
          width={180}
          height={36}
          animation="wave"
          sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Form Cards */}
        <Grid item xs={12} lg={8}>
          {/* First Card (e.g., Customer/Vendor Details) */}
          <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle}>
                <Skeleton
                  variant="rounded"
                  width={24}
                  height={24}
                  animation="wave"
                />
              </Box>
              <Skeleton
                variant="text"
                width={140}
                height={28}
                animation="wave"
              />
            </Box>

            <Grid container spacing={2.5}>
              {renderFormFields(firstCardFields)}
            </Grid>
          </Card>

          {/* Second Card (e.g., Company Details) */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle}>
                <Skeleton
                  variant="rounded"
                  width={24}
                  height={24}
                  animation="wave"
                />
              </Box>
              <Skeleton
                variant="text"
                width={160}
                height={28}
                animation="wave"
              />
            </Box>

            <Grid container spacing={2.5}>
              {renderFormFields(secondCardFields)}
            </Grid>
          </Card>
        </Grid>

        {/* Right Column - Status & Actions */}
        <Grid item xs={12} lg={4}>
          {/* Status Card */}
          <Card sx={{ p: 3, borderRadius: 2, mb: showDangerZone ? 3 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle}>
                <Skeleton
                  variant="rounded"
                  width={24}
                  height={24}
                  animation="wave"
                />
              </Box>
              <Skeleton
                variant="text"
                width={60}
                height={28}
                animation="wave"
              />
            </Box>

            {/* Radio button skeletons */}
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={24}
                  animation="wave"
                />
              </Box>
            ))}
          </Card>

          {/* Danger Zone Card (for edit mode) */}
          {showDangerZone && (
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 3,
                border: '2px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={iconBoxStyle}>
                  <Skeleton
                    variant="rounded"
                    width={24}
                    height={24}
                    animation="wave"
                  />
                </Box>
                <Skeleton
                  variant="text"
                  width={100}
                  height={28}
                  animation="wave"
                />
              </Box>

              <Skeleton
                variant="rounded"
                height={56}
                animation="wave"
                sx={{ mb: 2, bgcolor: 'rgba(0, 0, 0, 0.04)' }}
              />

              <Skeleton
                variant="rounded"
                height={45}
                animation="wave"
                sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
              />
            </Card>
          )}

          {/* Action Buttons */}
          <Box
            sx={{
              mt: showDangerZone ? 0 : 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Skeleton
              variant="rounded"
              height={48}
              animation="wave"
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.06)' }}
            />
            <Skeleton
              variant="rounded"
              height={48}
              animation="wave"
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormSkeleton;
