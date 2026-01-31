import React from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface CustomerPageLayoutProps {
  title: string;
  onBack: () => void;
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

const CustomerPageLayout: React.FC<CustomerPageLayoutProps> = ({
  title,
  onBack,
  leftColumn,
  rightColumn,
}) => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={onBack}
          aria-label="Go back to previous page"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
          {title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {leftColumn}
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {rightColumn}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerPageLayout;
