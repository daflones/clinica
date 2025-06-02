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
  useTheme,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessCenterIcon,
} from '@mui/icons-material';
// Importações do react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import clientsService from '../services/clientsService';
import ClientFormDialog from './ClientFormDialog';
import NotificationSystem from './NotificationSystem';
import PageHeader from './PageHeader';

const ClientsPage = () => {
  const { supabase } = useSupabase(); // Added back supabase as it's needed for client operations
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    title: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    field: 'created_at',
    direction: 'desc',
  });

  // Função para buscar clientes
  const fetchClients = useCallback(async () => {
    try {
      const filterOption = statusFilter !== 'all' ? { status: statusFilter } : {};
      const searchOption = searchTerm ? { search: searchTerm } : {};

      // Usando o serviço de clientes com opções de filtro
      const { data, error } = await clientsService.getAllClients({
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction,
        filter: {
          ...filterOption,
          ...searchOption,
        },
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }, [statusFilter, searchTerm, sortConfig.field, sortConfig.direction]);

  // Função para lidar com o sucesso na criação/edição de clientes
  const handleClientSuccess = async (clientData, action) => {
    try {
      // Recarrega a lista de clientes para garantir que está atualizada
      const updatedClients = await fetchClients();
      setClients(updatedClients);

      setSnackbar({
        open: true,
        message:
          action === 'create'
            ? 'Cliente adicionado com sucesso!'
            : 'Cliente atualizado com sucesso!',
        severity: 'success',
        title: 'Sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar lista de clientes:', error);
      setSnackbar({
        open: true,
        message: 'Cliente salvo, mas houve um erro ao atualizar a lista.',
        severity: 'warning',
        title: 'Aviso',
      });
    }
  };

  // Função para lidar com erros na criação/edição de clientes
  const handleClientError = errorMessage => {
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error',
      title: 'Erro',
    });
  };

  // Função para abrir o diálogo de edição
  const handleEditClick = client => {
    setEditClient(client);
    setOpenDialog(true);
  };

  // Função para fechar o diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditClient(null);
  };

  // Função para excluir cliente
  const handleDeleteClient = async id => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      setIsMenuLoading(true);
      const { success, error } = await clientsService.deleteClient(id);

      if (error) throw error;

      if (success) {
        // Recarrega a lista para garantir que está sincronizada
        const updatedClients = await fetchClients();
        setClients(updatedClients);

        setSnackbar({
          open: true,
          message: 'Cliente removido com sucesso!',
          severity: 'success',
          title: 'Sucesso',
        });
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setSnackbar({
        open: true,
        message: `Erro ao excluir cliente: ${error.message}`,
        severity: 'error',
        title: 'Falha na operação',
      });
    } finally {
      setIsMenuLoading(false);
      handleCloseMenu();
    }
  };

  // Função para filtrar clientes por status
  const handleFilterChange = newFilter => {
    setStatusFilter(newFilter);
  };

  // Função para lidar com a busca com debounce
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = e => {
    const value = e.target.value;

    // Limpa o timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Configura um novo timeout
    const timer = setTimeout(() => {
      setSearchTerm(value);
      setPage(0); // Reset para a primeira página ao buscar
    }, 500);

    setSearchTimeout(timer);
  };

  const handleOpenAddDialog = () => {
    setEditClient(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = client => {
    setEditClient(client);
    setOpenDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  const showNotification = (message, severity = 'success', title = '') => {
    setSnackbar({
      open: true,
      message,
      severity,
      title,
    });
  };

  // Carregar clientes quando o componente for montado ou quando os filtros mudarem
  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await fetchClients();
        if (isMounted) {
          setClients(data);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        if (isMounted) {
          setSnackbar({
            open: true,
            message: 'Erro ao carregar clientes. Tente novamente mais tarde.',
            severity: 'error',
            title: 'Erro',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      isMounted = false;
    };
  }, [fetchClients]);

  // Gerar as iniciais para o avatar
  const getInitials = name => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Formatar data
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Obter label para status
  const getStatusLabel = status => {
    switch (status) {
      case 'lead':
        return 'Lead';
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  // As cores de status agora são aplicadas diretamente nos cards

  // Estado para o menu de opções de cada card
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null); // Cliente selecionado no menu
  const [isMenuLoading, setIsMenuLoading] = useState(false); // Estado de carregamento para ações do menu

  // Organizar clientes por status para o Drag & Drop
  const [clientsByStatus, setClientsByStatus] = useState({
    lead: [],
    active: [],
    inactive: [],
  });

  useEffect(() => {
    // Organizando clientes por status
    const grouped = {
      lead: clients.filter(client => client.status === 'lead'),
      active: clients.filter(client => client.status === 'active'),
      inactive: clients.filter(client => client.status === 'inactive'),
    };
    setClientsByStatus(grouped);
  }, [clients]);

  // Não precisamos mais calcular clientes exibidos com paginação, já que estamos usando visualização por cards

  // Chips de filtros de status
  const statusFilters = [
    { value: 'all', label: 'Todos', color: 'default' },
    { value: 'lead', label: 'Leads', color: 'info' },
    { value: 'active', label: 'Ativos', color: 'success' },
    { value: 'inactive', label: 'Inativos', color: 'error' },
  ];

  // Função para abrir o menu de opções
  const handleOpenMenu = (event, client) => {
    event.stopPropagation(); // Impede que o evento propague para o card
    setMenuAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  // Função para fechar o menu de opções
  const handleCloseMenu = () => {
    if (!isMenuLoading) {
      setMenuAnchorEl(null);
      setSelectedClient(null);
    }
  };

  // Função para lidar com o drag & drop
  const handleDragEnd = async result => {
    const { source, destination, draggableId } = result;

    // Se não houver destino ou o destino for o mesmo que a origem, não faz nada
    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    // Pega o status de destino (removendo o prefixo 'status-')
    const newStatus = destination.droppableId.replace('status-', '');

    // Encontra o cliente que foi arrastado
    const clientId = draggableId.replace('client-', '');
    const clientToUpdate = clients.find(c => c.id === clientId);

    if (clientToUpdate && clientToUpdate.status !== newStatus) {
      try {
        setLoading(true);

        // Atualiza o status localmente primeiro para feedback imediato
        setClients(prev => prev.map(c => (c.id === clientId ? { ...c, status: newStatus } : c)));

        // Depois atualiza no servidor
        const updatedClient = { ...clientToUpdate, status: newStatus };
        const { error } = await clientsService.updateClient(clientId, updatedClient);

        if (error) throw error;

        // Recarrega a lista para garantir que está sincronizada
        const updatedClients = await fetchClients();
        setClients(updatedClients);

        setSnackbar({
          open: true,
          message: `Cliente movido para ${getStatusLabel(newStatus)} com sucesso!`,
          severity: 'success',
          title: 'Status atualizado',
        });
      } catch (error) {
        console.error('Erro ao atualizar status do cliente:', error);
        setSnackbar({
          open: true,
          message: `Erro ao mover cliente: ${error.message}`,
          severity: 'error',
          title: 'Falha ao atualizar status',
        });

        // Reverte a mudança local em caso de erro
        const revertedClients = await fetchClients();
        setClients(revertedClients);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Gerenciamento de Clientes"
        description="Gerencie sua base de clientes e leads em um único lugar"
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
            Adicionar Cliente
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
            placeholder="Buscar por nome, email ou telefone..."
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

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            {statusFilters.map(filter => (
              <Chip
                key={filter.value}
                label={filter.label}
                color={filter.color}
                variant={statusFilter === filter.value ? 'filled' : 'outlined'}
                onClick={() => handleFilterChange(filter.value)}
                sx={{ fontWeight: statusFilter === filter.value ? 'bold' : 'normal' }}
              />
            ))}

            <Tooltip title="Atualizar lista">
              <IconButton onClick={fetchClients} color="primary" sx={{ ml: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum cliente encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {searchTerm
              ? 'Tente mudar os filtros de busca'
              : 'Comece adicionando seu primeiro cliente'}
          </Typography>
          {!searchTerm && (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
              Adicionar Cliente
            </Button>
          )}
        </Box>
      ) : (
        <>
          {/* Interface de drag & drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Grid container spacing={3}>
              {/* Coluna de Leads */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(41, 182, 246, 0.1)'
                        : 'rgba(41, 182, 246, 0.05)',
                    borderTop: '4px solid',
                    borderColor: 'info.main',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="h6">Leads</Typography>
                    </Box>
                    <Chip
                      label={clientsByStatus.lead.length}
                      size="small"
                      color="info"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Droppable droppableId="status-lead">
                    {provided => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ minHeight: '50px' }}
                      >
                        {clientsByStatus.lead.map((client, index) => (
                          <Draggable
                            key={client.id}
                            draggableId={`client-${client.id}`}
                            index={index}
                          >
                            {provided => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  borderRadius: 2,
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                  },
                                }}
                              >
                                <CardHeader
                                  avatar={
                                    <Avatar sx={{ bgcolor: 'info.main' }}>
                                      {getInitials(client.name)}
                                    </Avatar>
                                  }
                                  title={client.name}
                                  subheader={formatDate(client.created_at)}
                                  action={
                                    <IconButton
                                      aria-label="settings"
                                      size="small"
                                      onClick={event => handleOpenMenu(event, client)}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  }
                                />
                                <CardContent sx={{ pt: 0 }}>
                                  {client.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <EmailIcon
                                        fontSize="small"
                                        sx={{ mr: 1, color: 'text.secondary' }}
                                      />
                                      <Typography variant="body2">{client.email}</Typography>
                                    </Box>
                                  )}
                                  {client.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <PhoneIcon
                                        fontSize="small"
                                        sx={{ mr: 1, color: 'text.secondary' }}
                                      />
                                      <Typography variant="body2">{client.phone}</Typography>
                                    </Box>
                                  )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenEditDialog(client)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClient(client.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </CardActions>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>

              {/* Coluna de Ativos */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(76, 175, 80, 0.05)',
                    borderTop: '4px solid',
                    borderColor: 'success.main',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessCenterIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6">Ativos</Typography>
                    </Box>
                    <Chip
                      label={clientsByStatus.active.length}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Droppable droppableId="status-active">
                    {provided => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ minHeight: '50px' }}
                      >
                        {clientsByStatus.active.map((client, index) => (
                          <Draggable
                            key={client.id}
                            draggableId={`client-${client.id}`}
                            index={index}
                          >
                            {provided => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  borderRadius: 2,
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                  },
                                }}
                              >
                                <CardHeader
                                  avatar={
                                    <Avatar sx={{ bgcolor: 'success.main' }}>
                                      {getInitials(client.name)}
                                    </Avatar>
                                  }
                                  title={client.name}
                                  subheader={formatDate(client.created_at)}
                                  action={
                                    <IconButton
                                      aria-label="settings"
                                      size="small"
                                      onClick={event => handleOpenMenu(event, client)}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  }
                                />
                                <CardContent sx={{ pt: 0 }}>
                                  {client.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <EmailIcon
                                        fontSize="small"
                                        sx={{ mr: 1, color: 'text.secondary' }}
                                      />
                                      <Typography variant="body2">{client.email}</Typography>
                                    </Box>
                                  )}
                                  {client.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <PhoneIcon
                                        fontSize="small"
                                        sx={{ mr: 1, color: 'text.secondary' }}
                                      />
                                      <Typography variant="body2">{client.phone}</Typography>
                                    </Box>
                                  )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenEditDialog(client)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClient(client.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </CardActions>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>

              {/* Coluna de Inativos */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(239, 83, 80, 0.1)'
                        : 'rgba(239, 83, 80, 0.05)',
                    borderTop: '4px solid',
                    borderColor: 'error.main',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Typography variant="h6">Inativos</Typography>
                    </Box>
                    <Chip
                      label={clientsByStatus.inactive.length}
                      size="small"
                      color="error"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Droppable droppableId="status-inactive">
                    {provided => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ minHeight: '50px' }}
                      >
                        {clientsByStatus.inactive.map((client, index) => (
                          <Draggable
                            key={client.id}
                            draggableId={`client-${client.id}`}
                            index={index}
                          >
                            {provided => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  borderRadius: 2,
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                  },
                                }}
                              >
                                <CardContent>
                                  <Typography variant="subtitle1">{client.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {client.email}
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            </Grid>
          </DragDropContext>
        </>
      )}

      <ClientFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        client={editClient}
        onSuccess={handleClientSuccess}
        onError={handleClientError}
      />

      {/* Menu de opções do cliente */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            handleOpenEditDialog(selectedClient);
            handleCloseMenu();
          }}
          disabled={isMenuLoading}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClient(selectedClient?.id)} disabled={isMenuLoading}>
          {isMenuLoading ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : (
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          )}
          {isMenuLoading ? 'Excluindo...' : 'Excluir'}
        </MenuItem>
      </Menu>

      <NotificationSystem
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        title={snackbar.title}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};

export default ClientsPage;
