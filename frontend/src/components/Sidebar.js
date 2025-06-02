import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  ListSubheader,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  FilterNone as FunnelIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as ProceduresIcon,
  AttachMoney as FinancialIcon,
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useSupabase();

  // Estado para controlar quais categorias estão expandidas
  const [expandedCategories, setExpandedCategories] = useState({
    Gestão: true,
    Sistema: true,
  });

  // Função para alternar a expansão da categoria
  const handleCategoryToggle = category => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Função para sair do sistema
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definição dos itens de menu
  const menuCategories = [
    {
      title: 'Principal',
      items: [{ name: 'Dashboard', icon: <DashboardIcon />, path: '/' }],
    },
    {
      title: 'Gestão',
      items: [
        { name: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
        { name: 'Agendamentos', icon: <EventIcon />, path: '/calendar' },
        { name: 'Procedimentos', icon: <ProceduresIcon />, path: '/procedures' },
        { name: 'Financeiro', icon: <FinancialIcon />, path: '/financial' },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { name: 'Configurações', icon: <SettingsIcon />, path: '/settings' },
        { name: 'Sair', icon: <LogoutIcon />, action: handleLogout },
      ],
    },
  ];

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 3,
          bgcolor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Automaclinic
        </Typography>
        <Typography variant="caption" sx={{ textAlign: 'center', display: 'block' }}>
          Sua automação de estética
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {user.email}
          </Typography>
        )}
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuCategories.map(category => (
          <React.Fragment key={category.title}>
            {/* Título da categoria */}
            <ListSubheader
              onClick={() => handleCategoryToggle(category.title)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'transparent',
                color: theme.palette.text.secondary,
                fontWeight: 'bold',
                fontSize: '0.75rem',
                lineHeight: '2.5em',
                my: 1,
              }}
            >
              {category.title}
              {category.items.length > 1 &&
                (expandedCategories[category.title] ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                ))}
            </ListSubheader>

            {/* Itens da categoria */}
            <Collapse in={expandedCategories[category.title] !== false} timeout="auto">
              <List component="div" disablePadding>
                {category.items.map(item => {
                  const isActive = item.path && location.pathname === item.path;
                  return (
                    <ListItem
                      button
                      component={item.path ? Link : 'div'}
                      to={item.path}
                      key={item.name}
                      onClick={e => {
                        if (isMobile) onClose();
                        if (item.action) {
                          e.preventDefault();
                          item.action();
                        }
                      }}
                      sx={{
                        my: 0.5,
                        ml: 2,
                        mr: 1,
                        borderRadius: 1,
                        bgcolor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.12)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? theme.palette.primary.main : 'inherit',
                          minWidth: 40,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 'bold' : 'normal',
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
            {category.title !== menuCategories[menuCategories.length - 1].title && (
              <Divider sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
