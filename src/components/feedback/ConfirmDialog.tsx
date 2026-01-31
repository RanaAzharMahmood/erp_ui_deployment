import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { COLORS } from '../../constants/colors';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onCancel,
}) => {
  const getConfirmButtonStyles = () => {
    switch (confirmColor) {
      case 'error':
        return {
          bgcolor: COLORS.error,
          '&:hover': { bgcolor: COLORS.errorHover },
        };
      case 'success':
        return {
          bgcolor: COLORS.success,
          '&:hover': { bgcolor: COLORS.successHover },
        };
      case 'primary':
      default:
        return {
          bgcolor: COLORS.primary,
          '&:hover': { bgcolor: COLORS.primaryHover },
        };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 350,
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{ fontWeight: 600, color: COLORS.text.primary }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="confirm-dialog-description"
          sx={{ color: COLORS.text.secondary }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: COLORS.border.default,
            color: COLORS.text.primary,
            textTransform: 'none',
            '&:hover': {
              borderColor: COLORS.border.dark,
              bgcolor: COLORS.background.default,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            ...getConfirmButtonStyles(),
            textTransform: 'none',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
