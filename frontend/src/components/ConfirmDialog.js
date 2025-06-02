import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

/**
 * Componente de diálogo de confirmação reutilizável
 * Útil para ações destrutivas como exclusão
 */
const ConfirmDialog = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  severity = 'warning',
}) => {
  // Mapeamento de cores por severidade
  const severityColors = {
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    success: '#4caf50',
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant="h6" component="div" sx={{ color: severityColors[severity] }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelButtonText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ bgcolor: severityColors[severity] }}
          autoFocus
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
