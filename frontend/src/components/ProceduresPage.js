import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const ProceduresPage = () => {
  const { supabase } = useSupabase();
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProcedure, setCurrentProcedure] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fechar o Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Buscar procedimentos do Supabase
  const fetchProcedures = React.useCallback(async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('procedures')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setProcedures(data || []);
      setError(null);
    } catch (error) {
      setError('Erro ao carregar procedimentos');
      setSnackbar({
        open: true,
        message: `Erro ao carregar procedimentos: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProcedures();
  }, [fetchProcedures]);

  // Filtrar procedimentos com base no termo de pesquisa
  const filteredProcedures = procedures.filter(procedure => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      procedure.name?.toLowerCase().includes(searchTermLower) ||
      procedure.description?.toLowerCase().includes(searchTermLower)
    );
  });

  // Função para abrir o diálogo de novo/editar procedimento
  const handleOpenDialog = (procedure = null) => {
    setCurrentProcedure(procedure);
    setOpenDialog(true);
  };

  // Função para fechar o diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProcedure(null);
  };

  // Função para formatar a duração em formato legível
  const formatDuration = minutes => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  // Função para formatar o preço em formato de moeda
  const formatPrice = price => {
    return `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Função para excluir procedimento
  const handleDeleteProcedure = async id => {
    if (window.confirm('Tem certeza que deseja excluir este procedimento?')) {
      try {
        const { error } = await supabase.from('procedures').delete().eq('id', id);

        if (error) throw error;

        // Atualizar a lista de procedimentos
        setProcedures(procedures.filter(p => p.id !== id));

        setSnackbar({
          open: true,
          message: 'Procedimento excluído com sucesso!',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao excluir procedimento. Tente novamente.',
          severity: 'error',
        });
      }
    }
  };

  // Função para atualizar o formulário
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para salvar procedimento
  const handleSaveProcedure = async () => {
    if (!formData.name || !formData.duration || !formData.price) {
      setSnackbar({
        open: true,
        message: 'Por favor, preencha todos os campos obrigatórios',
        severity: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (currentProcedure) {
        // Atualizar procedimento existente
        const { error } = await supabase
          .from('procedures')
          .update({
            name: formData.name,
            description: formData.description,
            duration: parseInt(formData.duration, 10),
            price: parseFloat(formData.price),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProcedure.id);

        if (error) throw error;

        // Atualizar a lista de procedimentos
        const updatedProcedures = procedures.map(p =>
          p.id === currentProcedure.id ? { ...p, ...formData } : p
        );
        setProcedures(updatedProcedures);

        setSnackbar({
          open: true,
          message: 'Procedimento atualizado com sucesso!',
          severity: 'success',
        });
      } else {
        // Criar novo procedimento
        const { data, error } = await supabase
          .from('procedures')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              duration: parseInt(formData.duration, 10),
              price: parseFloat(formData.price),
            },
          ])
          .select();

        if (error) throw error;

        // Adicionar o novo procedimento à lista
        setProcedures([...procedures, ...data]);

        setSnackbar({
          open: true,
          message: 'Procedimento criado com sucesso!',
          severity: 'success',
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao salvar procedimento. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Procedimentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
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
          Novo Procedimento
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <TextField
          placeholder="Pesquisar procedimentos..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Card sx={{ borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Typography
          variant="h6"
          sx={{ p: 2, fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          Lista de Procedimentos
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Duração</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredProcedures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum procedimento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcedures.map(procedure => (
                  <TableRow key={procedure.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {procedure.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {procedure.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatDuration(procedure.duration)}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(140, 82, 255, 0.1)',
                          color: 'primary.main',
                          fontWeight: 'medium',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="medium">
                        {formatPrice(procedure.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(procedure)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            sx={{ color: 'error.main' }}
                            onClick={() => handleDeleteProcedure(procedure.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Diálogo de Novo/Editar Procedimento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {currentProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              name="name"
              label="Nome do Procedimento"
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2, mt: 1 }}
              required
            />

            <TextField
              fullWidth
              name="description"
              multiline
              rows={3}
              label="Descrição"
              value={formData.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                name="duration"
                label="Duração (minutos)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                inputProps={{ min: 1, step: 1 }}
              />

              <TextField
                fullWidth
                name="price"
                label="Preço"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProcedure}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)',
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              },
            }}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting
              ? 'Salvando...'
              : currentProcedure
              ? 'Salvar Alterações'
              : 'Adicionar Procedimento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificação */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProceduresPage;
