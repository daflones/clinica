import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  IconButton,
  Grid,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const CalendarPage = () => {
  const { supabase } = useSupabase();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    procedure_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
  });

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      
      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients!appointments_client_id_fkey (id, name, email, phone),
          procedures (id, name, duration, price)
        `)
        .order('date', { ascending: true });
        
      if (appointmentsError) throw appointmentsError;
      
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
        
      if (clientsError) throw clientsError;
      
      // Fetch procedures
      const { data: proceduresData, error: proceduresError } = await supabase
        .from('procedures')
        .select('*')
        .order('name', { ascending: true });
        
      if (proceduresError) throw proceduresError;
      
      setAppointments(appointmentsData || []);
      setClients(clientsData || []);
      setProcedures(proceduresData || []);
      
    } catch (error) {
      setError('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  
  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Navigation handlers
  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };
  
  const handleToday = () => {
    setDate(new Date());
  };
  
  // View change handler
  const handleViewChange = (event, newView) => {
    setView(newView);
  };
  
  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open appointment dialog
  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        client_id: appointment.client_id,
        procedure_id: appointment.procedure_id,
        date: appointment.date.split('T')[0],
        time: appointment.time,
        notes: appointment.notes || '',
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        client_id: '',
        procedure_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: '',
      });
    }
    setOpenDialog(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Save appointment
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    
    if (!supabase) return;
    
    try {
      setLoading(true);
      
      const appointmentData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      if (selectedAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', selectedAppointment.id);
          
        if (error) throw error;
      } else {
        // Create new appointment
        appointmentData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('appointments')
          .insert([appointmentData]);
          
        if (error) throw error;
      }
      
      // Reload data
      await fetchData();
      handleCloseDialog();
      
    } catch (error) {
      setError('Error saving appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Render view based on selected view type
  const renderView = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderWeekView();
    }
  };
  
  // Render day view
  const renderDayView = () => {
    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    });

    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
        {dayAppointments.length > 0 ? (
          dayAppointments.map((appointment) => (
            <Card key={appointment.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">
                {appointment.time} - {appointment.client?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {appointment.procedures?.name}
              </Typography>
              {appointment.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {appointment.notes}
                </Typography>
              )}
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => handleOpenDialog(appointment)}
                >
                  Edit
                </Button>
              </Box>
            </Card>
          ))
        ) : (
          <Typography>No appointments for this day.</Typography>
        )}
      </Paper>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          {days.map((day, index) => (
            <Box key={index} textAlign="center" width="100%" p={1}>
              <Typography variant="subtitle2">
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </Typography>
              <Typography variant="body2">
                {day.getDate()}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Box display="flex" flexDirection="column" gap={2}>
          {days.map((day, dayIndex) => {
            const dayAppointments = appointments.filter(appointment => {
              const appointmentDate = new Date(appointment.date);
              return (
                appointmentDate.getDate() === day.getDate() &&
                appointmentDate.getMonth() === day.getMonth() &&
                appointmentDate.getFullYear() === day.getFullYear()
              );
            });
            
            return (
              <Card key={dayIndex} sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {day.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </Typography>
                {dayAppointments.length > 0 ? (
                  dayAppointments.map(appointment => (
                    <Box 
                      key={appointment.id} 
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenDialog(appointment)}
                    >
                      <Typography variant="body2">
                        {appointment.time} - {appointment.client?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.procedures?.name}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No appointments
                  </Typography>
                )}
              </Card>
            );
          })}
        </Box>
      </Paper>
    );
  };
  
  // Render month view
  const renderMonthView = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const weeks = [];
    let week = [];
    
    // Fill in empty days at the start of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      week.push(null);
    }
    
    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getDate() === currentDate.getDate() &&
          appointmentDate.getMonth() === currentDate.getMonth() &&
          appointmentDate.getFullYear() === currentDate.getFullYear()
        );
      });
      
      week.push({
        date: currentDate,
        day,
        hasAppointments: dayAppointments.length > 0,
      });
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Fill in remaining days of the last week
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }
    
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <Typography key={day} variant="subtitle2" textAlign="center">
              {day}
            </Typography>
          ))}
        </Box>
        
        {weeks.map((week, weekIndex) => (
          <Box 
            key={weekIndex} 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 1,
              mb: 1
            }}
          >
            {week.map((day, dayIndex) => (
              day ? (
                <Card 
                  key={dayIndex}
                  sx={{
                    p: 1,
                    minHeight: 100,
                    bgcolor: day.date.toDateString() === new Date().toDateString() 
                      ? 'action.hover' 
                      : 'background.paper',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    setDate(day.date);
                    setView('day');
                  }}
                >
                  <Typography variant="body2">
                    {day.day}
                  </Typography>
                  {day.hasAppointments && (
                    <Box 
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mt: 0.5,
                      }}
                    />
                  )}
                </Card>
              ) : (
                <div key={dayIndex} />
              )
            ))}
          </Box>
        ))}
      </Paper>
    );
  };
  
  // Render appointment form
  const renderAppointmentForm = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <form onSubmit={handleSaveAppointment}>
        <DialogTitle>
          {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Client</InputLabel>
                <Select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Procedure</InputLabel>
                <Select
                  name="procedure_id"
                  value={formData.procedure_id}
                  onChange={handleInputChange}
                  label="Procedure"
                >
                  {procedures.map((procedure) => (
                    <MenuItem key={procedure.id} value={procedure.id}>
                      {procedure.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                type="date"
                name="date"
                label="Date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                type="time"
                name="time"
                label="Time"
                value={formData.time}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Appointment
        </Button>
      </Box>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handlePrevDay}>
            <ChevronLeftIcon />
          </IconButton>
          <Button onClick={handleToday} variant="outlined" sx={{ mx: 1 }}>
            Today
          </Button>
          <IconButton onClick={handleNextDay}>
            <ChevronRightIcon />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ ml: 2 }}>
            {view === 'month'
              ? date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              : date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        
        <Tabs
          value={view}
          onChange={handleViewChange}
          aria-label="calendar view"
        >
          <Tab value="day" label="Day" icon={<CalendarTodayIcon />} />
          <Tab value="week" label="Week" icon={<ViewWeekIcon />} />
          <Tab value="month" label="Month" icon={<ViewModuleIcon />} />
        </Tabs>
      </Box>
      
      {renderView()}
      {renderAppointmentForm()}
    </Box>
  );
};

export default CalendarPage;
