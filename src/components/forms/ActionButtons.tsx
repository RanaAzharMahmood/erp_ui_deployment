import React from 'react';
import { Box, Button } from '@mui/material';

interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  layout?: 'horizontal' | 'vertical';
}

/**
 * Reusable action buttons component
 * Used across all forms for consistent button styling and behavior
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  isDisabled = false,
  layout = 'vertical',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: 2,
        mt: layout === 'horizontal' ? 0 : 3,
      }}
    >
      <Button
        fullWidth={layout === 'vertical'}
        variant="outlined"
        onClick={onCancel}
        disabled={isSubmitting}
        sx={{
          py: 1.5,
          textTransform: 'none',
          borderColor: '#E0E0E0',
          color: '#666666',
          '&:hover': {
            borderColor: '#BDBDBD',
            bgcolor: 'rgba(0, 0, 0, 0.02)',
          },
        }}
      >
        {cancelLabel}
      </Button>
      <Button
        fullWidth={layout === 'vertical'}
        variant="contained"
        onClick={onSubmit}
        disabled={isDisabled || isSubmitting}
        sx={{
          py: 1.5,
          textTransform: 'none',
          bgcolor: '#FF6B35',
          '&:hover': {
            bgcolor: '#FF8E53',
          },
          '&:disabled': {
            bgcolor: '#FFB399',
            color: 'white',
          },
        }}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </Box>
  );
};

export default ActionButtons;
