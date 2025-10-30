import { useEffect } from 'react';
import apiClient from '@api/apiClient';
import useLoginContext from './useLoginContext';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoginPage - Handles Cognito OAuth callback only
 *
 * This page is responsible for:
 * 1. Receiving the auth code from Cognito redirect
 * 2. Exchanging it for access/refresh tokens
 * 3. Storing tokens and redirecting to dashboard
 *
 * This is NOT a landing page - users should not visit this directly.
 * They arrive here only after authenticating with Cognito.
 */
export default function LoginPage() {
  const { setToken } = useLoginContext();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    async function handleCognitoCallback() {
      if (authCode) {
        try {
          const tokenResponse = await apiClient.getToken(authCode);

          // Store both tokens in localStorage for persistence
          localStorage.setItem(
            'auth_tokens',
            JSON.stringify({
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
            }),
          );

          // Keep backward compatibility - store access token for existing code
          sessionStorage.setItem(
            'token',
            JSON.stringify(tokenResponse.access_token),
          );

          setToken(tokenResponse.access_token);

          // Redirect to dashboard after successful login
          navigate('/');
        } catch (error) {
          console.error('Error fetching token:', error);
          // Redirect to home page on error
          navigate('/home');
        }
      } else {
        // No auth code - redirect to home page
        navigate('/home');
      }
    }

    handleCognitoCallback();
  }, [navigate, setToken]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#181818',
      }}
    >
      <CircularProgress size={60} sx={{ color: '#4a5fa8' }} />
      <Typography variant="h6" sx={{ color: '#ffffff' }}>
        Logging you in...
      </Typography>
    </Box>
  );
}
