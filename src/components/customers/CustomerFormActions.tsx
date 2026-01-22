import React from 'react';
import { Box, Button, Card, Alert, CircularProgress } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';

interface CustomerFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

const cancelButtonStyle = {
  py: 1.5,
  textTransform: 'none',
  borderColor: '#E0E0E0',
  color: '#666666',
  '&:hover': {
    borderColor: '#BDBDBD',
    bgcolor: 'rgba(0, 0, 0, 0.02)',
  },
};

const submitButtonStyle = {
  py: 1.5,
  textTransform: 'none',
  bgcolor: '#FF6B35',
  '&:hover': {
    bgcolor: '#FF8E53',
  },
  '&.Mui-disabled': {
    bgcolor: 'rgba(255, 107, 53, 0.5)',
    color: 'white',
  },
};

export const DangerZoneCard: React.FC<{ onDelete: () => void; isDeleting?: boolean }> = ({
  onDelete,
  isDeleting = false,
}) => {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 3,
        border: '2px solid #EF5350',
        bgcolor: 'rgba(239, 83, 80, 0.02)',
      }}
      role="region"
      aria-labelledby="customer-danger-zone-title"
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
          aria-hidden="true"
        >
          <WarningIcon sx={{ color: '#EF5350', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF5350' }} id="customer-danger-zone-title">
          Danger Zone
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 2 }} id="customer-danger-zone-warning">
        These actions are permanent and cannot be undone. Please proceed with
        caution.
      </Alert>

      <Button
        fullWidth
        variant="contained"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label="Delete this customer"
        aria-describedby="customer-danger-zone-warning"
        sx={{
          bgcolor: 'rgba(239, 83, 80, 0.15)',
          color: '#EF5350',
          textTransform: 'none',
          py: 1.5,
          '&:hover': {
            bgcolor: 'rgba(239, 83, 80, 0.25)',
          },
          '&.Mui-disabled': {
            bgcolor: 'rgba(239, 83, 80, 0.1)',
            color: 'rgba(239, 83, 80, 0.5)',
          },
        }}
      >
        {isDeleting ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#EF5350' }} aria-hidden="true" />
            Deleting...
          </Box>
        ) : (
          'Delete Customer'
        )}
      </Button>
    </Card>
  );
};

const CustomerFormActions: React.FC<CustomerFormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel,
  onDelete,
  isSubmitting = false,
}) => {
  return (
    <>
      {onDelete && <DangerZoneCard onDelete={onDelete} isDeleting={isSubmitting} />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={cancelButtonStyle}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onSubmit}
          disabled={isSubmitting}
          sx={submitButtonStyle}
        >
          {isSubmitting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: 'white' }} />
              {submitLabel}
            </Box>
          ) : (
            submitLabel
          )}
        </Button>
      </Box>
    </>
  );
};

export default CustomerFormActions;
