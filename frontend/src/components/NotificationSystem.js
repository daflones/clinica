import React from 'react';
import {
  Snackbar,
  Alert,
  Slide,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

/**
 * Sistema de notificação aperfeiçoado com animações e estilos modernos
 */
const NotificationSystem = ({
  open,
  message,
  severity = 'info',
  title = '',
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = {
    vertical: 'top',
    horizontal: 'right',
  },
}) => {
  // Icones para cada tipo de severidade
  const iconMap = {
    success: <CheckCircle />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  // Cores de fundo para cada tipo de severidade
  const backgroundMap = {
    success: 'linear-gradient(45deg, #4caf50 0%, #2e7d32 100%)',
    error: 'linear-gradient(45deg, #f44336 0%, #c62828 100%)',
    warning: 'linear-gradient(45deg, #ff9800 0%, #e65100 100%)',
    info: 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)',
  };

  // Títulos padrão se não for fornecido um
  const defaultTitles = {
    success: 'Sucesso!',
    error: 'Erro',
    warning: 'Atenção',
    info: 'Informação',
  };

  // Função de transição para a notificação
  const SlideTransition = props => {
    return <Slide {...props} direction="left" />;
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      TransitionComponent={SlideTransition}
    >
      <Alert
        elevation={6}
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: 300,
          background: backgroundMap[severity],
          '& .MuiAlert-icon': {
            alignItems: 'center',
          },
        }}
        icon={iconMap[severity]}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box>
          {(title || defaultTitles[severity]) && (
            <Typography variant="subtitle2" fontWeight="bold">
              {title || defaultTitles[severity]}
            </Typography>
          )}
          <Typography variant="body2">{message}</Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default NotificationSystem;
