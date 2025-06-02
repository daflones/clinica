import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  HealthAndSafety as HealthIcon,
  Medication as MedicationIcon,
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

const MedicalRecordsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Form state
  const [recordForm, setRecordForm] = useState({
    record_date: new Date(),
    record_type: 'consultation',
    title: '',
    description: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    doctor_name: '',
    attachments: '',
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const fetchPatientDetails = async () => {
      setLoading(true);
      try {
        // Buscar detalhes do paciente
        const { data: patientData, error: patientError } = await patientsService.getPatientById(
          patientId
        );
        if (patientError) throw patientError;
        setPatient(patientData);

        // Buscar prontuu00e1rios do paciente
        const { data: recordsData, error: recordsError } = await patientsService.getMedicalRecords(
          patientId
        );
        if (recordsError) throw recordsError;
        setRecords(recordsData || []);
      } catch (error) {
        console.error('Erro ao buscar dados do paciente:', error.message);
        showSnackbar(`Erro ao carregar dados: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const openCreateDialog = () => {
    setRecordForm({
      record_date: new Date(),
      record_type: 'consultation',
      title: '',
      description: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      doctor_name: '',
      attachments: '',
    });
    setDialogType('create');
    setOpenDialog(true);
  };

  const openEditDialog = record => {
    setRecordForm({
      ...record,
      record_date: record.record_date ? parseISO(record.record_date) : new Date(),
    });
    setDialogType('edit');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };

  const openConfirmDialog = record => {
    setSelectedRecord(record);
    setConfirmDialogOpen(true);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setRecordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = date => {
    setRecordForm(prev => ({
      ...prev,
      record_date: date,
    }));
  };

  const validateForm = () => {
    if (!recordForm.title || recordForm.title.trim() === '') {
      showSnackbar('O tu00edtulo do prontuu00e1rio u00e9 obrigatu00f3rio', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formattedData = {
        ...recordForm,
        record_date: format(recordForm.record_date, 'yyyy-MM-dd'),
      };

      let result;
      if (dialogType === 'create') {
        result = await patientsService.addMedicalRecord(patientId, formattedData);
      } else {
        // Adicione a funu00e7u00e3o updateMedicalRecord ao patientsService
        //result = await patientsService.updateMedicalRecord(selectedRecord.id, formattedData);
        showSnackbar(
          'Funu00e7u00e3o de atualizau00e7u00e3o de prontuu00e1rio ainda nu00e3o implementada',
          'warning'
        );
        closeDialog();
        return;
      }

      if (result.error) throw result.error;

      showSnackbar(
        `Prontuu00e1rio ${dialogType === 'create' ? 'adicionado' : 'atualizado'} com sucesso!`,
        'success'
      );

      closeDialog();

      // Atualizar os prontuu00e1rios
      const { data: updatedRecords } = await patientsService.getMedicalRecords(patientId);
      setRecords(updatedRecords || []);
    } catch (error) {
      console.error(
        `Erro ao ${dialogType === 'create' ? 'adicionar' : 'atualizar'} prontuu00e1rio:`,
        error.message
      );
      showSnackbar(
        `Erro ao ${dialogType === 'create' ? 'adicionar' : 'atualizar'} prontuu00e1rio: ${
          error.message
        }`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      // Adicione a funu00e7u00e3o deleteMedicalRecord ao patientsService
      showSnackbar(
        'Funu00e7u00e3o de exclusu00e3o de prontuu00e1rio ainda nu00e3o implementada',
        'warning'
      );
    } catch (error) {
      console.error('Erro ao excluir prontuu00e1rio:', error.message);
      showSnackbar('Erro ao excluir prontuu00e1rio: ' + error.message, 'error');
    } finally {
      setLoading(false);
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

  // Formatar data para exibiu00e7u00e3o
  const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return 'Data invu00e1lida';
    }
  };

  // Renderiza informau00e7u00f5es do paciente
  const renderPatientInfo = () => {
    if (!patient) return null;

    return (
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{patient.name}</Typography>
              </Box>

              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data de Nascimento"
                    secondary={formatDate(patient.birthdate)}
                  />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HealthIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Plano de Sau00fade"
                    secondary={patient.health_insurance || 'Particular'}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MedicalIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Informau00e7u00f5es de Contato</Typography>
              </Box>

              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Telefone"
                    secondary={patient.phone || 'Nu00e3o informado'}
                  />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemText primary="Email" secondary={patient.email || 'Nu00e3o informado'} />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemText
                    primary="Endereu00e7o"
                    secondary={patient.address || 'Nu00e3o informado'}
                  />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemText
                    primary="Contato de Emergu00eancia"
                    secondary={patient.emergency_contact || 'Nu00e3o informado'}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderMedicalRecords = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (records.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <MedicalIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhum prontuu00e1rio cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cadastre o primeiro prontuu00e1rio mu00e9dico para este paciente.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Adicionar Prontuu00e1rio
          </Button>
        </Paper>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Novo Prontuu00e1rio
          </Button>
        </Box>

        {records.map(record => (
          <Accordion key={record.id} sx={{ mb: 1, borderRadius: 1, overflow: 'hidden' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {record.record_type === 'consultation' ? (
                      <MedicalIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    ) : record.record_type === 'exam' ? (
                      <DescriptionIcon color="info" sx={{ mr: 1, fontSize: 20 }} />
                    ) : (
                      <MedicationIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    )}
                    <Typography variant="subtitle1" fontWeight="medium">
                      {record.title}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(record.record_date)}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Chip
                    label={
                      record.record_type === 'consultation'
                        ? 'Consulta'
                        : record.record_type === 'exam'
                        ? 'Exame'
                        : 'Tratamento'
                    }
                    size="small"
                    sx={{
                      bgcolor:
                        record.record_type === 'consultation'
                          ? 'rgba(140, 82, 255, 0.1)'
                          : record.record_type === 'exam'
                          ? 'rgba(3, 169, 244, 0.1)'
                          : 'rgba(156, 39, 176, 0.1)',
                      color:
                        record.record_type === 'consultation'
                          ? 'primary.main'
                          : record.record_type === 'exam'
                          ? 'info.main'
                          : 'secondary.main',
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ py: 1 }}>
                {record.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Descriu00e7u00e3o
                    </Typography>
                    <Typography variant="body2">{record.description}</Typography>
                  </Box>
                )}

                {record.diagnosis && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Diagnu00f3stico
                    </Typography>
                    <Typography variant="body2">{record.diagnosis}</Typography>
                  </Box>
                )}

                {record.treatment && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tratamento
                    </Typography>
                    <Typography variant="body2">{record.treatment}</Typography>
                  </Box>
                )}

                {record.prescription && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Prescriu00e7u00e3o
                    </Typography>
                    <Typography variant="body2">{record.prescription}</Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Mu00e9dico: {record.doctor_name || 'Nu00e3o informado'}
                  </Typography>

                  <Box>
                    <IconButton size="small" onClick={() => openEditDialog(record)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => openConfirmDialog(record)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  if (loading && !patient) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <PageHeader
        title="Prontuu00e1rio Mu00e9dico"
        subtitle={patient ? `Paciente: ${patient.name}` : 'Carregando dados do paciente...'}
        backButton
        onBackClick={() => navigate('/patients')}
      />

      {renderPatientInfo()}

      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Prontuu00e1rios" icon={<MedicalIcon />} iconPosition="start" />
          <Tab label="Histu00f3rico de Consultas" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Exames" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Tratamentos" icon={<MedicationIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderMedicalRecords()}
      {activeTab === 1 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Histu00f3rico de Consultas</Typography>
          <Typography variant="body2" color="text.secondary">
            Esta funcionalidade seru00e1 implementada em breve.
          </Typography>
        </Box>
      )}
      {activeTab === 2 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Exames</Typography>
          <Typography variant="body2" color="text.secondary">
            Esta funcionalidade seru00e1 implementada em breve.
          </Typography>
        </Box>
      )}
      {activeTab === 3 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Tratamentos</Typography>
          <Typography variant="body2" color="text.secondary">
            Esta funcionalidade seru00e1 implementada em breve.
          </Typography>
        </Box>
      )}

      {/* Dialog para criar/editar prontuu00e1rio */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'create' ? 'Adicionar Novo Prontuu00e1rio' : 'Editar Prontuu00e1rio'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="title"
                label="Tu00edtulo*"
                value={recordForm.title}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Tipo de Registro*</InputLabel>
                <Select
                  name="record_type"
                  value={recordForm.record_type}
                  onChange={handleInputChange}
                  label="Tipo de Registro*"
                >
                  <MenuItem value="consultation">Consulta</MenuItem>
                  <MenuItem value="exam">Exame</MenuItem>
                  <MenuItem value="treatment">Tratamento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBrLocale}>
                <DatePicker
                  label="Data*"
                  value={recordForm.record_date}
                  onChange={handleDateChange}
                  renderInput={params => (
                    <TextField {...params} fullWidth margin="dense" variant="outlined" required />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="doctor_name"
                label="Nome do Mu00e9dico"
                value={recordForm.doctor_name}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descriu00e7u00e3o"
                value={recordForm.description}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="diagnosis"
                label="Diagnu00f3stico"
                value={recordForm.diagnosis}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="treatment"
                label="Tratamento"
                value={recordForm.treatment}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="prescription"
                label="Prescriu00e7u00e3o"
                value={recordForm.prescription}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                variant="outlined"
                multiline
                rows={3}
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
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {dialogType === 'create' ? 'Adicionar' : 'Atualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmau00e7u00e3o para exclusu00e3o */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar exclusu00e3o"
        content={`Tem certeza que deseja excluir este prontuu00e1rio? Esta au00e7u00e3o nu00e3o pode ser desfeita.`}
        isLoading={loading}
      />

      {/* Snackbar de notificau00e7u00e3o */}
      <Snackbar
        open={snackbar.open}
        handleClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default MedicalRecordsPage;
