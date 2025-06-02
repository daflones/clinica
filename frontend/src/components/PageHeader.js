import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton 
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de cabeçalho de página padronizado
 * Oferece título, descrição, botão de voltar e ações personalizadas
 */
const PageHeader = ({
  title,
  description,
  showBackButton = false,
  actionButton = null,
  actionIcon = null,
  actionText = 'Ação',
  onActionClick = () => {},
}) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {showBackButton && (
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 1.5, 
              color: 'text.secondary' 
            }}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>

      {actionButton && (
        <Button
          variant="contained"
          startIcon={actionIcon}
          onClick={onActionClick}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            background: 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
            },
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;
