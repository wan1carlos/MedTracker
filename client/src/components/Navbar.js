import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  // Listen for changes to localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };

    // Create a custom event for auth state changes
    const handleAuthChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch auth change event
    window.dispatchEvent(new Event('authStateChanged'));
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mr: 2
          }}
        >
          <img 
            src="/logo512.png" 
            alt="MedTracker Logo" 
            style={{ 
              height: '40px',
              marginRight: '10px'
            }} 
          />
          <Typography variant="h6" component="div">
            MedTracker
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {user ? (
          <>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Hi, {user.first_name}
            </Typography>
            <Button 
              color="inherit" 
              sx={{ mx: 1 }}
              onClick={() => navigate(user.is_admin ? '/admin' : '/dashboard')}
            >
              {user.is_admin ? 'Admin Dashboard' : 'Dashboard'}
            </Button>
            {!user.is_admin && (
              <Button 
                color="inherit" 
                sx={{ mx: 1 }}
                onClick={() => navigate('/profile')}
              >
                Profile
              </Button>
            )}
            <Button 
              color="inherit"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              color="inherit" 
              sx={{ mx: 1 }}
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              sx={{ mx: 1 }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              color="inherit" 
              sx={{ mx: 1 }}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 