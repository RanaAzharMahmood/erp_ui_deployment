import React from 'react';
import { Box, Card, Typography, useMediaQuery, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { COLORS } from '../../constants/colors';

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  backgroundColor: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  backgroundColor,
  iconColor,
  trend,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getIconSize = () => {
    if (isMobile) return 44;
    if (isTablet) return 48;
    return 56;
  };

  const getIconFontSize = () => {
    if (isMobile) return 22;
    if (isTablet) return 24;
    return 28;
  };

  const formatValue = (val: number): string => {
    if (isMobile || isTablet) {
      return formatCompactNumber(val);
    }
    return formatCurrency(val);
  };

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 1.5, md: 2 },
        border: `1px solid ${COLORS.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          width: getIconSize(),
          height: getIconSize(),
          minWidth: getIconSize(),
          borderRadius: { xs: 1.5, md: 2 },
          backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': {
            fontSize: getIconFontSize(),
            color: iconColor,
          },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Typography
          variant="body2"
          sx={{
            color: COLORS.text.secondary,
            fontWeight: 500,
            mb: 0.25,
            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: COLORS.text.primary,
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {formatValue(value)}
        </Typography>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.25,
              flexWrap: 'wrap',
            }}
          >
            {trend.isPositive ? (
              <TrendingUpIcon
                sx={{ fontSize: { xs: 14, md: 16 }, color: COLORS.success }}
              />
            ) : (
              <TrendingDownIcon
                sx={{ fontSize: { xs: 14, md: 16 }, color: COLORS.error }}
              />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend.isPositive ? COLORS.success : COLORS.error,
                fontWeight: 600,
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
              }}
            >
              {trend.value}%
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: COLORS.text.muted,
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              vs last week
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default KPICard;
