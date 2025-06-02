import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  LinearProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Componente de dialog de formulu00e1rio reutilizu00e1vel
 * Fornece um layout padru00e3o para todos os formulu00e1rios em dialogs
 */
const FormDialog = ({
  open,
  onClose,
  title,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  onSubmit,
  children,
  maxWidth = 'sm',
  loading = false,
  disableSubmit = false,
  fullWidth = true,
  subtitle,
}) => {
  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: { borderRadius: 3 },
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            zIndex: 1,
            background: 'transparent',
          }}
        />
      )}

      <DialogTitle sx={{ p: 3, pb: subtitle ? 1 : 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={loading}
            edge="end"
            sx={{
              color: 'text.secondary',
              mt: -1,
              mr: -1,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading} sx={{ borderRadius: 2 }}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || disableSubmit}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
            },
            px: 3,
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
