import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  onBack?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

/**
 * Reusable page header component
 * Used across all pages for consistent header styling
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton,
  backPath,
  onBack,
  actionButton,
}) => {
  const navigate = useNavigate();

  // Show back button if explicitly set or if backPath is provided
  const shouldShowBackButton = showBackButton || !!backPath;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {shouldShowBackButton && (
          <IconButton
            onClick={handleBack}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography
          variant={shouldShowBackButton ? 'h5' : 'h4'}
          sx={{ fontWeight: 600, color: '#1A1A1A' }}
        >
          {title}
        </Typography>
      </Box>

      {actionButton && (
        <Button
          variant="contained"
          startIcon={actionButton.icon || <AddIcon />}
          onClick={actionButton.onClick}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            bgcolor: '#FF6B35',
            '&:hover': {
              bgcolor: '#FF8E53',
            },
          }}
        >
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;
