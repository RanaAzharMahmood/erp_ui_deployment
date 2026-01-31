import React from 'react';
import { Box, Card, Typography, useMediaQuery, useTheme } from '@mui/material';
import { COLORS } from '../../constants/colors';

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  height?: number | { xs?: number; sm?: number; md?: number };
  action?: React.ReactNode;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  children,
  height = 300,
  action,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getHeight = (): number => {
    if (typeof height === 'number') {
      if (isMobile) return Math.max(height * 0.7, 200);
      if (isTablet) return Math.max(height * 0.85, 250);
      return height;
    }
    if (isMobile) return height.xs ?? 220;
    if (isTablet) return height.sm ?? 260;
    return height.md ?? 300;
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: COLORS.text.primary,
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
          }}
        >
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ height: getHeight(), width: '100%' }}>
        {children}
      </Box>
    </Card>
  );
};

export default ChartWrapper;
