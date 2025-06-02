import React, { useState } from 'react';
import TestComponent from './components/TestComponent';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, IconButton, AppBar, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import LeadDetails from './components/LeadDetails';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ClientsPage from './components/ClientsPage';
import CalendarPage from './components/CalendarPage';
import ProceduresPage from './components/ProceduresPage';
import SalesFunnelPage from './components/SalesFunnelPage';

import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8c52ff',
      light: '#a67fff',
      dark: '#6b40c9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e542fe',
      light: '#ff74ff',
      dark: '#a000ca',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      card: '#252525',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: ['Poppins', 'Arial', 'sans-serif'].join(','),
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(45deg, #8c52ff 0%, #e542fe 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #7b46e3 0%, #d93be3 100%)',
          },
          boxShadow: '0 4px 10px rgba(140, 82, 255, 0.3)',
        },
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 'bold',
          color: '#8c52ff',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Componente de rota protegida que redireciona para login se não autenticado
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabase();

  if (loading) return <div>Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout principal com sidebar para usuários autenticados
const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSupabase();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!user) return <>{children}</>;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          boxShadow: 'rgb(0 0 0 / 5%) 0px 1px 2px 0px',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            {document.title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <SupabaseProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lead/:id"
              element={
                <ProtectedRoute>
                  <LeadDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funnel"
              element={
                <ProtectedRoute>
                  <SalesFunnelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/procedures"
              element={
                <ProtectedRoute>
                  <ProceduresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <div style={{ padding: '20px' }}>
                    <Typography variant="h4">Configurações</Typography>
                    <Typography>Página em construção</Typography>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="/test" element={<TestComponent />} />
          </Routes>
        </MainLayout>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;
