import React from 'react';
import { Box, Button, Snackbar, Alert, Divider } from '@mui/material';
import {
  Circle as CircleIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import FormSection from '../common/FormSection';
import StatusSelector from '../common/StatusSelector';
import DangerZone from '../common/DangerZone';

interface ItemFormActionsProps {
  mode: 'create' | 'edit';
  status: 'Active' | 'Prospect' | 'Inactive';
  isSubmitting: boolean;
  isDeleting?: boolean;
  error: string;
  successMessage: string;
  onStatusChange: (status: 'Active' | 'Prospect' | 'Inactive') => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onErrorClose: () => void;
  onSuccessClose: () => void;
}

const ItemFormActions: React.FC<ItemFormActionsProps> = ({
  mode,
  status,
  isSubmitting,
  isDeleting = false,
  error,
  successMessage,
  onStatusChange,
  onSubmit,
  onCancel,
  onDelete,
  onErrorClose,
  onSuccessClose,
}) => {
  const isEditMode = mode === 'edit';

  return (
    <>
      {/* Status */}
      <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
        <Divider sx={{ mb: 2, mt: -1 }} />
        <StatusSelector
          value={status}
          onChange={onStatusChange}
          options={['Active', 'Prospect', 'Inactive']}
        />
      </FormSection>

      {/* Danger Zone (Edit mode only) */}
      {isEditMode && onDelete && (
        <DangerZone
          onDelete={onDelete}
          itemName="Item"
          isDeleting={isDeleting}
        />
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: isEditMode ? 3 : 0 }}>
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
          startIcon={isEditMode ? <SaveIcon /> : <AddIcon />}
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
            ? isEditMode
              ? 'Saving...'
              : 'Creating...'
            : isEditMode
              ? 'Save Changes'
              : 'Create Item'}
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={onSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onSuccessClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={onErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ItemFormActions;
