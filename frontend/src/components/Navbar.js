import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';

const Navbar = () => {
  const { user, logout } = useSupabase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}
        >
          CRM Integrado
        </Typography>
        <Box>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
