import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, Button, TextField, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, TablePagination, CircularProgress, Chip, Avatar, Tooltip,
  useTheme, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import clientsService from '../services/clientsService';
import ClientFormDialog from './ClientFormDialog';
import NotificationSystem from './NotificationSystem';
import PageHeader from './PageHeader';

const ClientsPage = () => {
  const { supabase } = useSupabase();
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    title: ''
  });

  // Função para buscar clientes
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const filterOption = filter !== 'all' ? { status: filter } : {};
      const searchOption = searchTerm ? { search: searchTerm } : {};
      
      // Usando o serviço de clientes com opções de filtro
      const { data, error } = await clientsService.getAllClients({
        sortBy: 'created_at',
        sortOrder: 'desc',
        filter: {
          ...filterOption,
          ...searchOption
        }
      });

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error.message);
      setSnackbar({
        open: true,
        message: `Erro ao carregar clientes: ${error.message}`,
        severity: 'error',
        title: 'Falha na operação'
      });
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  // Função para lidar com o sucesso na criação/edição de clientes
  const handleClientSuccess = (clientData, action) => {
    if (action === 'create') {
      // Adicionar o novo cliente à lista
      setClients(prev => [clientData, ...prev]);
      setSnackbar({
        open: true,
        message: 'Cliente adicionado com sucesso!',
        severity: 'success',
        title: 'Sucesso'
      });
    } else {
      // Atualizar o cliente na lista
      setClients(prev => 
        prev.map(client => client.id === clientData.id ? clientData : client)
      );
      setSnackbar({
        open: true,
        message: 'Cliente atualizado com sucesso!',
        severity: 'success',
        title: 'Sucesso'
      });
    }
  };

  // Função para lidar com erros na criação/edição de clientes
  const handleClientError = (errorMessage) => {
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error',
      title: 'Erro'
    });
  };
  
  // Função para abrir o dialog de criação de cliente
  const handleOpenAddDialog = () => {
    setEditClient(null);
    setOpenDialog(true);
  };
  
  // Função para abrir o dialog de edição de cliente
  const handleOpenEditDialog = (client) => {
    setEditClient(client);
    setOpenDialog(true);
  };
  
  // Função para excluir cliente
  const handleDeleteClient = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const { success, error } = await clientsService.deleteClient(id);

      if (error) throw error;

      if (success) {
        setClients(prev => prev.filter(client => client.id !== id));
        setSnackbar({
          open: true,
          message: 'Cliente removido com sucesso!',
          severity: 'success',
          title: 'Sucesso'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error.message);
      setSnackbar({
        open: true,
        message: `Erro ao excluir cliente: ${error.message}`,
        severity: 'error',
        title: 'Falha na operação'
      });
    }
  };

  // Função para filtrar clientes por status
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Função para lidar com a busca
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Função para mudar de página na paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Função para mudar o número de itens por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Função para fechar o dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditClient(null);
  };
  
  // Carregar clientes quando o componente for montado
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  // Aplicar busca e filtros quando forem alterados
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 500); // Debounce para evitar muitas requisições
    
    return () => clearTimeout(timer);
  }, [searchTerm, filter, fetchClients]);

  // Gerar as iniciais para o avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Obter label para status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'lead': return 'Lead';
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  // Obter cor para status
  const getStatusColor = (status) => {
    switch (status) {
      case 'lead': return 'info';
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  // Calcular os clientes que devem ser exibidos com paginação
  const displayedClients = clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Chips de filtros de status
  const statusFilters = [
    { value: 'all', label: 'Todos', color: 'default' },
    { value: 'lead', label: 'Leads', color: 'info' },
    { value: 'active', label: 'Ativos', color: 'success' },
    { value: 'inactive', label: 'Inativos', color: 'error' }
  ];

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
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)' 
                : 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
                boxShadow: '0 8px 16px 0 rgba(123, 70, 227, 0.3)'
              }
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
          overflow: 'hidden'
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
              )
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            {statusFilters.map((statusFilter) => (
              <Chip
                key={statusFilter.value}
                label={statusFilter.label}
                color={statusFilter.color}
                variant={filter === statusFilter.value ? 'filled' : 'outlined'}
                onClick={() => handleFilterChange(statusFilter.value)}
                sx={{ fontWeight: filter === statusFilter.value ? 'bold' : 'normal' }}
              />
            ))}
            
            <Tooltip title="Atualizar lista">
              <IconButton onClick={fetchClients} color="primary" sx={{ ml: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      
        <TableContainer>
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
                {searchTerm ? 'Tente mudar os filtros de busca' : 'Comece adicionando seu primeiro cliente'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                >
                  Adicionar Cliente
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Contato</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedClients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {getInitials(client.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{client.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(client.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {client.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{client.email}</Typography>
                            </Box>
                          )}
                          {client.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{client.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(client.status)}
                          size="small"
                          color={getStatusColor(client.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(client)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <TablePagination
                component="div"
                count={clients.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Itens por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </>
          )}
        </TableContainer>
      </Paper>

      {/* Dialog de formulário de cliente com o novo componente */}
      <ClientFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        client={editClient}
        onSuccess={handleClientSuccess}
        onError={handleClientError}
      />

      {/* Sistema de notificação */}
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
