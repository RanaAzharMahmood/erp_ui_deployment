import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface TaxNotificationsProps {
  successMessage: string;
  error: string;
  onSuccessClose: () => void;
  onErrorClose: () => void;
}

const TaxNotifications: React.FC<TaxNotificationsProps> = ({
  successMessage,
  error,
  onSuccessClose,
  onErrorClose,
}) => {
  return (
    <>
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

export default TaxNotifications;
