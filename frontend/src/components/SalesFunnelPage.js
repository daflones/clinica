import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Grid,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const SalesFunnelPage = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState([]);

  // Dados do funil de vendas
  const funnelStages = [
    {
      id: 'new_leads',
      name: 'Novos Leads',
      count: 0,
      color: '#8c52ff',
      icon: <PhoneIcon />,
    },
    {
      id: 'first_contact',
      name: 'Primeiro Contato',
      count: 0,
      color: '#9c27b0',
      icon: <PhoneIcon />,
    },
    {
      id: 'scheduled_evaluation',
      name: 'Avaliação Agendada',
      count: 0,
      color: '#673ab7',
      icon: <PhoneIcon />,
    },
    {
      id: 'scheduled_procedure',
      name: 'Procedimento Agendado',
      count: 3,
      color: '#e91e63',
      icon: <PhoneIcon />,
    },
    {
      id: 'post_sale',
      name: 'Pós-venda / Recorrente',
      count: 1,
      color: '#4caf50',
      icon: <PhoneIcon />,
    },
  ];

  // Exemplo de clientes em cada estágio
  const sampleClients = [
    {
      id: 1,
      name: 'João Pereira',
      stage: 'scheduled_procedure',
      interest: 'Avaliação Facial',
      phone: '(11) 97654-3210',
      lastInteraction: '2025-05-29T18:37:08.363Z',
    },
    {
      id: 2,
      name: 'Ana Costa',
      stage: 'scheduled_procedure',
      interest: 'Preenchimento Labial, Skincare',
      phone: '(11) 96543-2109',
      lastInteraction: '2025-05-29T18:37:08.361Z',
    },
    {
      id: 3,
      name: 'Roberto Santos',
      stage: 'scheduled_procedure',
      interest: 'Microagulhamento',
      phone: '(11) 95432-1098',
      lastInteraction: '2025-05-29T18:37:08.362Z',
    },
    {
      id: 4,
      name: 'Maria Silva',
      stage: 'post_sale',
      interest: 'Botox',
      phone: '(11) 98765-4321',
      lastInteraction: '2025-05-29T18:37:08.361Z',
    },
  ];

  useEffect(() => {
    const fetchFunnelData = async () => {
      setLoading(true);
      try {
        // Em uma implementau00e7u00e3o real, buscaru00edamos dados do Supabase
        // Simulau00e7u00e3o de dados
        const processedFunnelData = funnelStages.map(stage => {
          // Conta quantos clientes estu00e3o neste estu00e1gio
          const stageClients = sampleClients.filter(client => client.stage === stage.id);
          return {
            ...stage,
            count: stageClients.length,
            clients: stageClients,
          };
        });

        setFunnelData(processedFunnelData);
      } catch (error) {
        console.error('Erro ao buscar dados do funil:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  // Funu00e7u00e3o para gerar iniciais a partir do nome
  const getInitials = name => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Funu00e7u00e3o para formatar data de u00faltima interau00e7u00e3o
  const formatLastInteraction = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Renderiza um card de cliente
  const renderClientCard = client => {
    return (
      <Card
        key={client.id}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {getInitials(client.name)}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="body1" fontWeight="bold">
                {client.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {client.phone}
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Agendado"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              color: 'warning.main',
              fontWeight: 'medium',
            }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Chip
            label={client.interest}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 'medium',
              mr: 1,
            }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {formatLastInteraction(client.lastInteraction)}
          </Typography>

          <Box>
            <Tooltip title="WhatsApp">
              <IconButton size="small" sx={{ color: '#25D366' }}>
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="E-mail">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <EmailIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Funil de Vendas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize e gerencie o progresso dos seus leads e clientes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          Novo Lead
        </Button>
      </Box>

      {/* Cards de resumo dos estu00e1gios */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {funnelData.map(stage => (
          <Grid
            item
            xs={12}
            sm={6}
            md={funnelData.length <= 5 ? 12 / funnelData.length : 4}
            key={stage.id}
          >
            <Card
              sx={{
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: `${stage.color}20`, color: stage.color }}>
                  {stage.icon}
                </Avatar>
                <Typography variant="h6" sx={{ ml: 1.5, fontWeight: 'medium' }}>
                  {stage.name}
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
              >
                <Typography variant="h3" fontWeight="bold">
                  {stage.count}
                </Typography>

                <Chip
                  icon={
                    stage.count > 0 ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )
                  }
                  label={`${stage.count > 0 ? '+' : ''}${stage.count > 0 ? stage.count * 5 : 0}%`}
                  size="small"
                  sx={{
                    bgcolor: stage.count > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    color: stage.count > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Seu00e7u00f5es do funil */}
      <Grid container spacing={3}>
        {funnelData.map(stage => (
          <Grid
            item
            xs={12}
            sm={6}
            md={funnelData.length <= 4 ? 12 / funnelData.length : 3}
            key={stage.id}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  borderRadius: '50px',
                  p: 0.75,
                  pl: 2,
                  bgcolor: `${stage.color}20`,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: stage.color }}>
                  {stage.name}
                </Typography>

                <Box
                  sx={{
                    ml: 'auto',
                    bgcolor: stage.color,
                    color: 'white',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  {stage.count}
                </Box>
              </Box>

              {/* Cards de clientes neste estu00e1gio */}
              {stage.clients && stage.clients.length > 0 ? (
                stage.clients.map(client => renderClientCard(client))
              ) : (
                <Box
                  sx={{
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhum cliente neste estu00e1gio
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SalesFunnelPage;
