import React from 'react';
import { Box, Card, Typography, Alert, Button } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface DangerZoneProps {
  onDelete: () => void;
  itemName?: string;
  isDeleting?: boolean;
}

/**
 * Reusable danger zone component
 * Used across all update pages for consistent delete functionality
 */
const DangerZone: React.FC<DangerZoneProps> = ({
  onDelete,
  itemName = 'Item',
  isDeleting = false,
}) => {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        border: '2px solid #EF5350',
        bgcolor: 'rgba(239, 83, 80, 0.02)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: 'rgba(239, 83, 80, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningIcon sx={{ color: '#EF5350', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF5350' }}>
          Danger Zone
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 2 }}>
        These actions are permanent and cannot be undone. Please proceed with
        caution.
      </Alert>

      <Button
        fullWidth
        variant="contained"
        onClick={onDelete}
        disabled={isDeleting}
        sx={{
          bgcolor: 'rgba(239, 83, 80, 0.15)',
          color: '#EF5350',
          textTransform: 'none',
          py: 1.5,
          '&:hover': {
            bgcolor: 'rgba(239, 83, 80, 0.25)',
          },
          '&:disabled': {
            bgcolor: 'rgba(239, 83, 80, 0.05)',
            color: '#EF5350',
            opacity: 0.6,
          },
        }}
      >
        {isDeleting ? 'Deleting...' : `Delete ${itemName}`}
      </Button>
    </Card>
  );
};

export default DangerZone;
