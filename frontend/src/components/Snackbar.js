import React from 'react';
import { Snackbar as MuiSnackbar, Alert, AlertTitle, Slide } from '@mui/material';

/**
 * Componente de notificau00e7u00e3o reutilizu00e1vel
 * Exibe mensagens de sucesso, erro, aviso e informau00e7u00e3o
 */
const Snackbar = ({
  open,
  onClose,
  message,
  severity = 'info',
  title,
  autoHideDuration = 6000,
}) => {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={Slide}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', boxShadow: 4 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar;
