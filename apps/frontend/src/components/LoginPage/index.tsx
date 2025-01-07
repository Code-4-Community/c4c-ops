import { useEffect } from 'react';
import apiClient from '@api/apiClient';
import useLoginContext from './useLoginContext';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';

/**
 * Login Page component first checks if the user has been redirected from the
 * Cognito login page with an authorization code. If the code is present, it
 * fetches the user's access token and stores it in the context.
 */
export default function LoginPage() {
  const { setToken } = useLoginContext();
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    async function getToken() {
      if (authCode) {
        try {
          const token = await apiClient.getToken(authCode);
          setToken(token);
          navigate('/');
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
    }
    getToken();
  }, [navigate, setToken]);
  return (
    <Stack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <Button
        variant="contained"
        color="primary"
        href="https://scaffolding.auth.us-east-2.amazoncognito.com/login?client_id=4c5b8m6tno9fvljmseqgmk82fv&response_type=code&scope=email+openid&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin"
      >
        Login
      </Button>
    </Stack>
  );
}
