import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  InputAdornment,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

// Serviços
import appointmentsService from '../services/appointmentsService';
import clientsService from '../services/clientsService';

// Componentes compartilhados
import PageHeader from './PageHeader';
import ConfirmDialog from './ConfirmDialog';
import Snackbar from './Snackbar';

/**
 * Componente para gerenciamento de agendamentos
 * Permite listar, filtrar, criar, editar e excluir agendamentos
 */
const AppointmentsPage = () => {
  const theme = useTheme();

  // Estados para os agendamentos
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Estados para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para filtros
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  // Estados para gerenciar clientes (para seleção nos formulários)
  const [clients, setClients] = useState([]);

  // Estados para diálogos
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  // Estados para formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    client_id: '',
    status: 'scheduled',
  });

  // Estados para notificações
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    title: '',
  });

  // Função para buscar agendamentos
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Prepara filtros
      const filterOption = filter !== 'all' ? { status: filter } : {};
      const dateOption = dateFilter ? { dateFrom: dateFilter } : {};

      // Busca os agendamentos com os filtros
      const { data, error } = await appointmentsService.getAllAppointments({
        sortBy: 'date',
        sortOrder: 'desc',
        filter: {
          ...filterOption,
          ...dateOption,
        },
      });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error.message);
      setSnackbar({
        open: true,
        message: `Erro ao carregar agendamentos: ${error.message}`,
        severity: 'error',
        title: 'Falha na operação',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, dateFilter]);

  // Função para buscar clientes (para os selects)
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await clientsService.getAllClients();

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error.message);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  // Funções para manipular sucesso na criação/edição
  const handleSuccess = (appointment, isEditing) => {
    // Adicionar/atualizar o agendamento na lista
    if (isEditing) {
      setAppointments(prev => prev.map(a => (a.id === appointment.id ? appointment : a)));

      setSnackbar({
        open: true,
        message: 'Agendamento atualizado com sucesso!',
        severity: 'success',
        title: 'Sucesso',
      });
    } else {
      setAppointments(prev => [appointment, ...prev]);

      setSnackbar({
        open: true,
        message: 'Agendamento criado com sucesso!',
        severity: 'success',
        title: 'Sucesso',
      });
    }

    // Fechar diálogos
    setOpenAddDialog(false);
    setOpenEditDialog(false);

    // Limpar formulário
    resetForm();
  };

  // Função para lidar com erros
  const handleError = (error, action) => {
    console.error(`Erro ao ${action} agendamento:`, error);

    setSnackbar({
      open: true,
      message: `Erro ao ${action} agendamento: ${error.message}`,
      severity: 'error',
      title: 'Erro',
    });
  };

  // Funções para abrir diálogos
  const handleOpenAddDialog = () => {
    resetForm();
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = appointment => {
    setCurrentAppointment(appointment);
    setFormData({
      title: appointment.title || '',
      description: appointment.description || '',
      date: new Date(appointment.date),
      client_id: appointment.client_id || '',
      status: appointment.status || 'scheduled',
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = appointment => {
    setCurrentAppointment(appointment);
    setOpenDeleteDialog(true);
  };

  // Função para excluir agendamento
  const handleDelete = async () => {
    if (!currentAppointment) return;

    try {
      const { success, error } = await appointmentsService.deleteAppointment(currentAppointment.id);

      if (error) throw error;

      if (success) {
        // Remover da lista
        setAppointments(prev => prev.filter(a => a.id !== currentAppointment.id));

        setSnackbar({
          open: true,
          message: 'Agendamento removido com sucesso!',
          severity: 'success',
          title: 'Sucesso',
        });
      }
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);

      setSnackbar({
        open: true,
        message: `Erro ao excluir agendamento: ${error.message}`,
        severity: 'error',
        title: 'Falha na operação',
      });
    } finally {
      setOpenDeleteDialog(false);
      setCurrentAppointment(null);
    }
  };

  // Função para lidar com mudanças no formulário
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para lidar com mudanças na data
  const handleDateChange = date => {
    setFormData(prev => ({
      ...prev,
      date,
    }));
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      client_id: '',
      status: 'scheduled',
    });
    setCurrentAppointment(null);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async e => {
    e.preventDefault();

    // Validação básica
    if (!formData.title) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe um título para o agendamento.',
        severity: 'warning',
        title: 'Atenção',
      });
      return;
    }

    if (!formData.client_id) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um cliente.',
        severity: 'warning',
        title: 'Atenção',
      });
      return;
    }

    if (!formData.date) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe uma data para o agendamento.',
        severity: 'warning',
        title: 'Atenção',
      });
      return;
    }

    try {
      if (currentAppointment) {
        // Editando um agendamento existente
        const { data, error } = await appointmentsService.updateAppointment(
          currentAppointment.id,
          formData
        );

        if (error) throw error;

        if (data) {
          handleSuccess(data, true);
        }
      } else {
        // Criando um novo agendamento
        const { data, error } = await appointmentsService.createAppointment(formData);

        if (error) throw error;

        if (data) {
          handleSuccess(data, false);
        }
      }
    } catch (error) {
      handleError(error, currentAppointment ? 'atualizar' : 'criar');
    }
  };

  // Função para lidar com a mudança de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Função para lidar com a mudança de linhas por página
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Função para lidar com a busca
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  // Função para lidar com a mudança de filtro
  const handleFilterChange = value => {
    setFilter(value);
  };

  // Função para formatar data
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Função para obter label do status
  const getStatusLabel = status => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      case 'rescheduled':
        return 'Reagendado';
      default:
        return 'Desconhecido';
    }
  };

  // Função para obter cor do status
  const getStatusColor = status => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      case 'rescheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Função para buscar nome do cliente pelo ID
  const getClientName = clientId => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Efeito para carregar agendamentos quando o componente montar
  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, [fetchAppointments, fetchClients]);

  // Efeito para aplicar filtros quando mudarem
  useEffect(() => {
    // Usar um timeout para evitar muitas requisições em sequência
    const timeoutId = setTimeout(() => {
      fetchAppointments();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filter, dateFilter, fetchAppointments]);

  // Calcular dados para exibição paginada
  const displayedAppointments = appointments
    .filter(appointment => {
      // Filtrar por termo de busca se houver
      if (searchTerm) {
        return (
          appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getClientName(appointment.client_id).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Gerenciamento de Agendamentos"
        description="Organize e acompanhe todos os seus agendamentos em um só lugar"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)'
                  : 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
                boxShadow: '0 8px 16px 0 rgba(123, 70, 227, 0.3)',
              },
            }}
          >
            Novo Agendamento
          </Button>
        }
      />

      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            placeholder="Buscar por título ou cliente..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DateTimePicker
              label="Filtrar por data"
              value={dateFilter}
              onChange={setDateFilter}
              renderInput={params => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            <Chip
              label="Todos"
              color="default"
              variant={filter === 'all' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('all')}
            />
            <Chip
              label="Agendados"
              color="info"
              variant={filter === 'scheduled' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('scheduled')}
            />
            <Chip
              label="Concluídos"
              color="success"
              variant={filter === 'completed' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('completed')}
            />
            <Chip
              label="Cancelados"
              color="error"
              variant={filter === 'canceled' ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('canceled')}
            />

            <Tooltip title="Atualizar lista">
              <IconButton onClick={fetchAppointments} color="primary" sx={{ ml: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : appointments.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum agendamento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filter !== 'all'
                ? 'Tente mudar os filtros ou adicione um novo agendamento'
                : 'Adicione seu primeiro agendamento clicando no botão acima'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Data e Hora</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedAppointments.map(appointment => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.title}</TableCell>
                      <TableCell>{getClientName(appointment.client_id)}</TableCell>
                      <TableCell>{formatDate(appointment.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(appointment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(appointment)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={appointments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página"
            />
          </>
        )}
      </Paper>

      {/* Diálogo para adicionar agendamento */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Agendamento</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título"
                  value={formData.title}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleFormChange}
                    label="Cliente"
                  >
                    {loadingClients ? (
                      <MenuItem value="">
                        <CircularProgress size={20} />
                        Carregando...
                      </MenuItem>
                    ) : (
                      clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DateTimePicker
                    label="Data e Hora"
                    value={formData.date}
                    onChange={handleDateChange}
                    renderInput={params => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descrição"
                  value={formData.description}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="scheduled">Agendado</MenuItem>
                    <MenuItem value="completed">Concluído</MenuItem>
                    <MenuItem value="canceled">Cancelado</MenuItem>
                    <MenuItem value="rescheduled">Reagendado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar agendamento */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Agendamento</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título"
                  value={formData.title}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleFormChange}
                    label="Cliente"
                  >
                    {loadingClients ? (
                      <MenuItem value="">
                        <CircularProgress size={20} />
                        Carregando...
                      </MenuItem>
                    ) : (
                      clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DateTimePicker
                    label="Data e Hora"
                    value={formData.date}
                    onChange={handleDateChange}
                    renderInput={params => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descrição"
                  value={formData.description}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="scheduled">Agendado</MenuItem>
                    <MenuItem value="completed">Concluído</MenuItem>
                    <MenuItem value="canceled">Cancelado</MenuItem>
                    <MenuItem value="rescheduled">Reagendado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Confirmar exclusão"
        content="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
      />

      {/* Componente de notificações */}
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
        title={snackbar.title}
        autoHideDuration={4000}
      />
    </Container>
  );
};

export default AppointmentsPage;
