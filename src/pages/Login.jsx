import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  Container,
  InputAdornment,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  let result;

  if (tab === 0) {
    // Login
    result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  } else {
    // Register
    result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    setLoading(false);

    if (result.success) {
      setTab(0);

      setFormData({
        name: '',
        email: formData.email,
        password: '',
      });
    } else {
      setError(result.message);
    }
  }
};


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
  <Paper
    elevation={12}
    sx={{
      p: { xs: 2.5, sm: 3 },
      borderRadius: 3,
      width: '100%',
      maxWidth: 400,
      mx: 'auto',
      bgcolor: 'rgba(255,255,255,0.97)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar
        sx={{
          width: 52,
          height: 52,
          bgcolor: 'primary.main',
          mb: 1.5,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 700,
          }}
        >
          C
        </Typography>
      </Avatar>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}
      >
        Mini CRM
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {tab === 0
          ? 'Sign in to your account'
          : 'Create a new account'}
      </Typography>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          minHeight: 40,
          '& .MuiTabs-indicator': {
            bgcolor: '#667eea',
          },
          '& .MuiTab-root': {
            minHeight: 40,
            fontWeight: 500,
            '&.Mui-selected': {
              color: '#667eea',
            },
          },
        }}
      >
        <Tab label="Sign In" />
        <Tab label="Sign Up" />
      </Tabs>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1.5,
            width: '100%',
          }}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {tab === 1 && (
          <TextField
            margin="dense"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1.5 }}
          />
        )}

        <TextField
          margin="dense"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#64748B' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        <TextField
          margin="dense"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete={
            tab === 0 ? 'current-password' : 'new-password'
          }
          value={formData.password}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#64748B' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            height: 44,
            borderRadius: 2,
            fontWeight: 600,
            background:
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background:
                'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
            },
          }}
        >
          {loading
            ? 'Loading...'
            : tab === 0
            ? 'Sign In'
            : 'Create Account'}
        </Button>
      </form>

      <Divider sx={{ my: 2, width: '100%' }} />

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
      >
        {tab === 0
          ? "Don't have an account? Sign up above"
          : 'Already have an account? Sign in above'}
      </Typography>
    </Box>
  </Paper>
</Container>
    </Box>
  );
};

export default Login;