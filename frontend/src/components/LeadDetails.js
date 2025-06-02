import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSupabase } from '../contexts/SupabaseContext';
import { getLeadById, updateLead, getLeadInteractions, addInteraction } from '../services/supabase';

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
];

const statusColors = {
  novo: 'primary',
  em_andamento: 'warning',
  convertido: 'success',
  perdido: 'error',
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshLeads } = useSupabase();

  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedLead, setEditedLead] = useState({});
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLeadData = async () => {
      try {
        setLoading(true);
        const leadData = await getLeadById(id);
        setLead(leadData);
        setEditedLead(leadData);

        const interactionsData = await getLeadInteractions(id);
        setInteractions(interactionsData);
      } catch (error) {
        console.error('Erro ao buscar dados do lead:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [id, navigate, user]);

  const handleBack = () => {
    navigate('/');
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancelar a ediu00e7u00e3o, redefinir os dados editados
      setEditedLead(lead);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setEditedLead({ ...editedLead, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      await updateLead(id, editedLead);
      setLead(editedLead);
      setEditMode(false);
      refreshLeads(); // Atualizar a lista de leads no dashboard
    } catch (error) {
      console.error('Erro ao salvar alterau00e7u00f5es:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenInteractionDialog = () => {
    setInteractionDialogOpen(true);
  };

  const handleCloseInteractionDialog = () => {
    setInteractionDialogOpen(false);
    setNewInteraction('');
  };

  const handleInteractionInputChange = e => {
    setNewInteraction(e.target.value);
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.trim()) return;

    try {
      const interaction = {
        lead_id: id,
        conteudo: newInteraction,
        created_at: new Date().toISOString(),
      };

      await addInteraction(interaction);

      // Atualizar a lista de interau00e7u00f5es
      const interactionsData = await getLeadInteractions(id);
      setInteractions(interactionsData);

      handleCloseInteractionDialog();
    } catch (error) {
      console.error('Erro ao adicionar interau00e7u00e3o:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!lead) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Voltar
          </Button>
          <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
            Lead nu00e3o encontrado
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Voltar para o Dashboard
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Detalhes do Lead */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h5" component="h1">
                {lead.nome || 'Lead sem nome'}
              </Typography>
              <Chip
                label={statusOptions.find(option => option.value === lead.status)?.label || 'Novo'}
                color={statusColors[lead.status] || 'primary'}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {editMode ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={editedLead.nome || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    value={editedLead.telefone || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editedLead.email || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={editedLead.status || 'novo'}
                    onChange={handleInputChange}
                    margin="normal"
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observau00e7u00f5es"
                    name="observacoes"
                    value={editedLead.observacoes || ''}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={handleEditToggle} disabled={updating}>
                      Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSaveChanges} disabled={updating}>
                      {updating ? <CircularProgress size={24} /> : 'Salvar Alterau00e7u00f5es'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Telefone:</Typography>
                    <Typography variant="body1">{lead.telefone || 'Nu00e3o informado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Email:</Typography>
                    <Typography variant="body1">{lead.email || 'Nu00e3o informado'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Fonte:</Typography>
                    <Typography variant="body1">{lead.fonte || 'WhatsApp'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Data de Criau00e7u00e3o:</Typography>
                    <Typography variant="body1">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : 'Nu00e3o informado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Observau00e7u00f5es:</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {lead.observacoes || 'Sem observau00e7u00f5es'}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" onClick={handleEditToggle}>
                    Editar Informau00e7u00f5es
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Interau00e7u00f5es */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Interau00e7u00f5es</Typography>
                <Button variant="contained" size="small" onClick={handleOpenInteractionDialog}>
                  Nova Interau00e7u00e3o
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List>
                {interactions && interactions.length > 0 ? (
                  interactions.map(interaction => (
                    <ListItem key={interaction.id} alignItems="flex-start" divider>
                      <ListItemText
                        primary={interaction.conteudo}
                        secondary={
                          interaction.created_at
                            ? new Date(interaction.created_at).toLocaleString()
                            : ''
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Nenhuma interau00e7u00e3o registrada" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para adicionar nova interau00e7u00e3o */}
      <Dialog
        open={interactionDialogOpen}
        onClose={handleCloseInteractionDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Adicionar Nova Interau00e7u00e3o</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Descriu00e7u00e3o da interau00e7u00e3o"
            fullWidth
            multiline
            rows={4}
            value={newInteraction}
            onChange={handleInteractionInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInteractionDialog}>Cancelar</Button>
          <Button onClick={handleAddInteraction} variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeadDetails;
