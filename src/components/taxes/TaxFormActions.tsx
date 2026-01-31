import React from 'react';
import { Box, Button } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';

interface TaxFormActionsProps {
  mode: 'add' | 'update';
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const TaxFormActions: React.FC<TaxFormActionsProps> = ({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  const isAddMode = mode === 'add';

  return (
    <Box sx={{ display: 'flex', gap: 2, ...(mode === 'update' && { mt: 3 }) }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={onCancel}
        disabled={isSubmitting}
        sx={{
          py: 1.5,
          textTransform: 'none',
          borderColor: '#E5E7EB',
          color: '#374151',
          '&:hover': {
            borderColor: '#D1D5DB',
            bgcolor: '#F9FAFB',
          },
        }}
      >
        Cancel
      </Button>
      <Button
        fullWidth
        variant="contained"
        onClick={onSubmit}
        disabled={isSubmitting}
        startIcon={isAddMode ? <AddIcon /> : <SaveIcon />}
        sx={{
          py: 1.5,
          textTransform: 'none',
          bgcolor: '#FF6B35',
          '&:hover': {
            bgcolor: '#E55A2B',
          },
        }}
      >
        {isSubmitting
          ? isAddMode
            ? 'Creating...'
            : 'Saving...'
          : isAddMode
          ? 'Add Tax'
          : 'Save Changes'}
      </Button>
    </Box>
  );
};

export default TaxFormActions;
