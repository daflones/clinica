import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBrLocale from 'date-fns/locale/pt-BR';
import { parseISO, format } from 'date-fns';
import patientsService from '../services/patientsService';
import PageHeader from './PageHeader';
import ConfirmDialog from './ConfirmDialog';
import Snackbar from './Snackbar';

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create' ou 'edit'
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form state
  const [patientForm, setPatientForm] = useState({
    name: '',
    cpf: '',
    birthdate: null,
    phone: '',
    email: '',
    address: '',
    health_insurance: '',
    emergency_contact: '',
    observations: '',
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Buscar pacientes ao iniciar o componente e quando os filtros mudarem
  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage, searchTerm, sortField, sortOrder]);

  const fetchPatients = async () => {
    setIsLoading(true);

    try {
      const { data, count, error } = await patientsService.getPatients(
        page,
        rowsPerPage,
        searchTerm,
        sortField,
        sortOrder
      );

      if (error) throw error;

      setPatients(data || []);
      setTotalPatients(count || 0);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error.message);
      showSnackbar('Erro ao carregar pacientes: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = field => {
    if (field === sortField) {
      // Inverte a ordem se clicar no mesmo campo
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Define o novo campo e ordem ascendente
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const openCreateDialog = () => {
    setPatientForm({
      name: '',
      cpf: '',
      birthdate: null,
      phone: '',
      email: '',
      address: '',
      health_insurance: '',
      emergency_contact: '',
      observations: '',
    });
    setDialogType('create');
    setOpenDialog(true);
  };

  const openEditDialog = patient => {
    setPatientForm({
      ...patient,
      birthdate: patient.birthdate ? parseISO(patient.birthdate) : null,
    });
    setDialogType('edit');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };

  const openConfirmDialog = patient => {
    setSelectedPatient(patient);
    setConfirmDialogOpen(true);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = date => {
    setPatientForm(prev => ({
      ...prev,
      birthdate: date,
    }));
  };

  const validateForm = () => {
    if (!patientForm.name || patientForm.name.trim() === '') {
      showSnackbar('O nome do paciente é obrigatório', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formattedData = {
        ...patientForm,
        birthdate: patientForm.birthdate ? format(patientForm.birthdate, 'yyyy-MM-dd') : null,
      };

      let result;
      if (dialogType === 'create') {
        result = await patientsService.createPatient(formattedData);
      } else {
        result = await patientsService.updatePatient(patientForm.id, formattedData);
      }

      if (result.error) throw result.error;

      showSnackbar(
        `Paciente ${dialogType === 'create' ? 'cadastrado' : 'atualizado'} com sucesso!`,
        'success'
      );

      closeDialog();
      fetchPatients();
    } catch (error) {
      console.error(
        `Erro ao ${dialogType === 'create' ? 'cadastrar' : 'atualizar'} paciente:`,
        error.message
      );
      showSnackbar(
        `Erro ao ${dialogType === 'create' ? 'cadastrar' : 'atualizar'} paciente: ${error.message}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const { error } = await patientsService.deletePatient(selectedPatient.id);

      if (error) throw error;

      showSnackbar('Paciente excluído com sucesso!', 'success');
      fetchPatients();
    } catch (error) {
      console.error('Erro ao excluir paciente:', error.message);
      showSnackbar('Erro ao excluir paciente: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Formatar data para exibição
  const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Calcular idade a partir da data de nascimento
  const calculateAge = birthdate => {
    if (!birthdate) return 'N/A';
    try {
      const birth = parseISO(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} anos`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Navegar para o prontuário médico do paciente
  const goToMedicalRecord = patientId => {
    navigate(`/medical-records/${patientId}`);
  };

  // Navegar para agendar consulta
  const scheduleAppointment = patientId => {
    navigate(`/appointments?patient=${patientId}`);
  };

  return (
    <Box sx={{ height: '100%' }}>
      <PageHeader title="Pacientes" subtitle="Gerenciamento de pacientes da clínica" />

      <Box sx={{ mb: 3 }}>
        <Card sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Buscar pacientes"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Nome, CPF ou email..."
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ height: '40px' }}
                >
                  Filtros
                </Button>
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                lg={7}
                sx={{ textAlign: { xs: 'left', md: 'right' } }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{ height: '40px' }}
                >
                  Novo Paciente
                </Button>
              </Grid>

              {showFilters && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Filtros avançados
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Plano de Saúde</InputLabel>
                          <Select label="Plano de Saúde" value={''} onChange={() => {}}>
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="unimed">Unimed</MenuItem>
                            <MenuItem value="amil">Amil</MenuItem>
                            <MenuItem value="sulamerica">SulAmérica</MenuItem>
                            <MenuItem value="bradesco">Bradesco</MenuItem>
                            <MenuItem value="particular">Particular</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider
                          dateAdapter={AdapterDateFns}
                          adapterLocale={ptBrLocale}
                        >
                          <DatePicker
                            label="Idade mínima"
                            value={null}
                            onChange={() => {}}
                            renderInput={params => <TextField {...params} size="small" fullWidth />}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>
                Nome
              </TableCell>
              <TableCell onClick={() => handleSort('birthdate')} sx={{ cursor: 'pointer' }}>
                Idade/Data de Nasc.
              </TableCell>
              <TableCell onClick={() => handleSort('phone')} sx={{ cursor: 'pointer' }}>
                Telefone
              </TableCell>
              <TableCell onClick={() => handleSort('health_insurance')} sx={{ cursor: 'pointer' }}>
                Plano de Saúde
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum paciente encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              patients.map(patient => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {patient.name.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {patient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.cpf || 'CPF não cadastrado'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{calculateAge(patient.birthdate)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(patient.birthdate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{patient.phone || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {patient.email || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {patient.health_insurance ? (
                      <Chip
                        label={patient.health_insurance}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(140, 82, 255, 0.1)',
                          color: 'primary.main',
                        }}
                      />
                    ) : (
                      <Chip
                        label="Particular"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          color: 'success.main',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ '& button': { mx: 0.5 } }}>
                      <Tooltip title="Prontuário médico">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => goToMedicalRecord(patient.id)}
                        >
                          <MedicalIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Agendar consulta">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => scheduleAppointment(patient.id)}
                        >
                          <CalendarIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar paciente">
                        <IconButton size="small" onClick={() => openEditDialog(patient)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir paciente">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openConfirmDialog(patient)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalPatients}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </TableContainer>

      {/* Dialog para criar/editar paciente */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'create' ? 'Cadastrar Novo Paciente' : 'Editar Paciente'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Nome completo*"
                value={patientForm.name}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cpf"
                label="CPF"
                value={patientForm.cpf}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                placeholder="000.000.000-00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBrLocale}>
                <DatePicker
                  label="Data de nascimento"
                  value={patientForm.birthdate}
                  onChange={handleDateChange}
                  renderInput={params => (
                    <TextField {...params} fullWidth margin="dense" variant="outlined" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Telefone"
                value={patientForm.phone}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                placeholder="(00) 00000-0000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                value={patientForm.email}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Endereço completo"
                value={patientForm.address}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="health_insurance"
                label="Plano de Saúde"
                value={patientForm.health_insurance}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                placeholder="Nome do plano ou particular"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="emergency_contact"
                label="Contato de emergência"
                value={patientForm.emergency_contact}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                placeholder="Nome e telefone"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="observations"
                label="Observações"
                value={patientForm.observations}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
          >
            {dialogType === 'create' ? 'Cadastrar' : 'Atualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        content={`Tem certeza que deseja excluir o paciente ${selectedPatient?.name}? Esta ação não pode ser desfeita.`}
        isLoading={isLoading}
      />

      {/* Snackbar de notificação */}
      <Snackbar
        open={snackbar.open}
        handleClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default PatientsPage;
