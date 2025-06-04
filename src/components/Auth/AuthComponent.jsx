import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { authService } from '../../services/authService';

const AuthComponent = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthSuccess = async (event, data) => {
      try {
        await authService.initialize();
        setLoading(false);
        onAuthSuccess();
      } catch (err) {
        setError('Failed to initialize authentication');
        console.error('Auth initialization error:', err);
        setLoading(false);
      }
    };

    // Listen for both OAuth callback and auth-success events
    window.electronAPI.onOAuthCallback(handleAuthSuccess);
    window.electronAPI.onAuthSuccess(handleAuthSuccess);

    return () => {
      window.electronAPI.removeOAuthCallback(handleAuthSuccess);
      window.electronAPI.removeAuthSuccess(handleAuthSuccess);
    };
  }, [onAuthSuccess]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.login();
    } catch (err) {
      setError('Failed to start authentication process');
      console.error('Auth error:', err);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: 3,
        backgroundColor: 'var(--background-base)',
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          padding: 4,
          backgroundColor: 'var(--background-elevated-base)',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'var(--text-base)',
            marginBottom: 3,
            fontWeight: 700,
          }}
        >
          Welcome to YouTube Music
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'var(--text-subdued)',
            marginBottom: 4,
          }}
        >
          Sign in to access your music library and start listening
        </Typography>

        {error && (
          <Typography
            variant="body2"
            sx={{
              color: '#ff4444',
              marginBottom: 2,
            }}
          >
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            backgroundColor: 'var(--essential-bright-accent)',
            color: 'var(--background-base)',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: '500px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#1ed760',
              transform: 'scale(1.04)',
            },
            '&:disabled': {
              backgroundColor: 'var(--background-tinted-base)',
              color: 'var(--text-subdued)',
            },
          }}
        >
          {loading ? (
            <CircularProgress
              size={24}
              sx={{
                color: 'var(--background-base)',
              }}
            />
          ) : (
            'Sign in with YouTube'
          )}
        </Button>

        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-subdued)',
            marginTop: 3,
            fontSize: '0.75rem',
          }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthComponent; 