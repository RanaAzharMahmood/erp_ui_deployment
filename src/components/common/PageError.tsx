import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ApiError, getErrorMessage } from '../../utils/apiError';

interface PageErrorProps {
  error: unknown;
  onRetry?: () => void;
}

const PageError: React.FC<PageErrorProps> = ({ error, onRetry }) => {
  const { title, detail, retryable } = getErrorMessage(error);

  const is403 = error instanceof ApiError && error.statusCode === 403;
  const isNetwork =
    error instanceof Error &&
    (error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch'));

  const Icon = is403 ? LockOutlinedIcon : isNetwork ? WifiOffIcon : ErrorOutlineIcon;
  const iconColor = is403 ? '#BDBDBD' : '#EF5350';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        p: 4,
        textAlign: 'center',
      }}
    >
      <Icon sx={{ fontSize: 64, color: iconColor, mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', maxWidth: 400, mb: 3 }}>
        {detail}
      </Typography>
      {retryable && onRetry && (
        <Button variant="outlined" onClick={onRetry} sx={{ borderColor: '#FF6B35', color: '#FF6B35' }}>
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default PageError;
