import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Avatar,
  Divider,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Event as EventIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import NotificationSystem from './NotificationSystem';

// Registrar componentes Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    newLeads: 0,
    conversionRate: 0,
    revenue: 0,
  });
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [appointmentsChartData, setAppointmentsChartData] = useState({
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Agendamentos',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#8c52ff',
        backgroundColor: 'rgba(140, 82, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  });
  const [conversionChartData, setConversionChartData] = useState({
    labels: ['Leads', 'Contato', 'Agendamento', 'Procedimento', 'Recorrente'],
    datasets: [
      {
        label: 'Funil de Vendas',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(140, 82, 255, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(103, 58, 183, 0.8)',
          'rgba(233, 30, 99, 0.8)',
          'rgba(76, 175, 80, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  });

  // Função para atualizar os gráficos com base nos agendamentos
  const updateChartsData = useCallback(
    async (appointments = []) => {
      try {
        // 1. Atualizar gráfico de agendamentos por dia da semana
        const appointmentsByDay = [0, 0, 0, 0, 0, 0, 0]; // Seg a Dom

        appointments.forEach(appt => {
          const day = new Date(appt.date).getDay(); // 0 = Domingo, 1 = Segunda, etc.
          // Ajustar para Segunda = 0, Domingo = 6
          const adjustedDay = day === 0 ? 6 : day - 1;
          if (adjustedDay >= 0 && adjustedDay < 7) {
            appointmentsByDay[adjustedDay]++;
          }
        });

        setAppointmentsChartData(prev => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: appointmentsByDay,
            },
          ],
        }));

        // 2. Atualizar funil de vendas
        const { count: totalLeads } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        const { count: contactedLeads } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .not('notes', 'is', null);

        const { count: totalAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true });

        const { count: completedProcedures } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'concluido');

        const { count: recurringClients } = await supabase
          .from('appointments')
          .select('client_id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .gt('total_appointments', 1);

        setConversionChartData(prev => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: [
                totalLeads || 0,
                Math.round((contactedLeads / Math.max(1, totalLeads)) * 100) || 0,
                totalAppointments || 0,
                completedProcedures || 0,
                recurringClients?.count || 0,
              ],
            },
          ],
        }));
      } catch (error) {
        console.error('Erro ao atualizar gráficos:', error);
      }
    },
    [supabase]
  );

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Conexão com o banco de dados não disponível');
      }

      // Buscar dados para as estatísticas
      const today = new Date().toISOString().split('T')[0];

      // 1. Contar agendamentos de hoje
      const { count: appointmentsToday, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      if (appointmentsError) throw appointmentsError;

      // 2. Contar novos leads (clientes dos últimos 7 dias)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: newLeads, error: leadsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      if (leadsError) throw leadsError;

      // 3. Calcular taxa de conversão (agendamentos / leads totais * 100)
      const { count: totalLeads, error: totalLeadsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (totalLeadsError) throw totalLeadsError;

      const { count: totalAppointments, error: totalAppointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      if (totalAppointmentsError) throw totalAppointmentsError;

      const conversionRate =
        totalLeads > 0 ? Math.round((totalAppointments / totalLeads) * 100) : 0;

      // 4. Calcular receita total (soma dos valores dos procedimentos agendados)
      const { data: appointmentsData, error: appointmentsDataError } = await supabase
        .from('appointments')
        .select('procedures(price)');

      if (appointmentsDataError) throw appointmentsDataError;

      const revenue = appointmentsData.reduce((total, appt) => {
        return total + (appt.procedures?.price || 0);
      }, 0);

      // Atualizar estado com os dados reais
      setStats({
        appointmentsToday: appointmentsToday || 0,
        newLeads: newLeads || 0,
        conversionRate: conversionRate,
        revenue: revenue,
      });

      // Buscar clientes recentes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Buscar agendamentos recentes com dados dos clientes e procedimentos
      const { data: appointmentsList, error: appointmentsListError } = await supabase
        .from('appointments')
        .select(
          `
          *,
          client:clients!appointments_client_id_fkey (id, name, email, phone),
          procedures (id, name, price, duration)
        `
        )
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(5);

      if (appointmentsListError) throw appointmentsListError;
      setAppointments(appointmentsList || []);

      // Atualizar dados dos gráficos
      await updateChartsData(appointmentsList || []);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      setSnackbar({
        open: true,
        message: `Erro ao carregar dados: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, updateChartsData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Formata moeda brasileira
  const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Obter iniciais do nome
  const getInitials = name => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Atualizar Dados
        </Button>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Agendamentos Hoje
                  </Typography>
                  <Typography variant="h5">{stats.appointmentsToday}</Typography>
                </div>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <EventIcon />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  +12% em relação à semana passada
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Novos Leads (7d)
                  </Typography>
                  <Typography variant="h5">{stats.newLeads}</Typography>
                </div>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  +5% em relação à semana passada
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Taxa de Conversão
                  </Typography>
                  <Typography variant="h5">{stats.conversionRate}%</Typography>
                </div>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <SpeedIcon />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingDownIcon color="error" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  -2% em relação ao mês passado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Receita do Mês
                  </Typography>
                  <Typography variant="h5">{formatCurrency(stats.revenue)}</Typography>
                </div>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <AttachMoneyIcon />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  +15% em relação ao mês passado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agendamentos por Dia da Semana
              </Typography>
              <Box height={300}>
                <Line
                  data={appointmentsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Funil de Vendas
              </Typography>
              <Box height={300}>
                <Doughnut
                  data={conversionChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Listas de Clientes e Agendamentos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Clientes Recentes</Typography>
                <Button size="small" onClick={() => navigate('/clientes')}>
                  Ver Todos
                </Button>
              </Box>
              <List>
                {clients.map(client => (
                  <React.Fragment key={client.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>{getInitials(client.name)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={client.name}
                        secondary={client.email || 'Sem e-mail'}
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        href={`https://wa.me/55${client.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
                {clients.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" py={2}>
                    Nenhum cliente cadastrado recentemente
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Próximos Agendamentos</Typography>
                <Button size="small" onClick={() => navigate('/agenda')}>
                  Ver Todos
                </Button>
              </Box>
              <List>
                {appointments.map(appointment => (
                  <React.Fragment key={appointment.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <CalendarTodayIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${appointment.client?.name || 'Cliente não encontrado'}`}
                        secondary={
                          <>
                            <Box component="span" display="block">
                              {new Date(`${appointment.date}T${appointment.time}`).toLocaleString(
                                'pt-BR',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </Box>
                            <Box component="span" display="block">
                              {appointment.procedures?.name || 'Procedimento não especificado'}
                            </Box>
                          </>
                        }
                      />
                      <Chip
                        label={appointment.status || 'agendado'}
                        color={
                          appointment.status === 'concluido'
                            ? 'success'
                            : appointment.status === 'cancelado'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
                {appointments.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" py={2}>
                    Nenhum agendamento encontrado
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <NotificationSystem
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default Dashboard;
