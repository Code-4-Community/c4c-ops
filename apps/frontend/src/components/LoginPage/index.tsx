import { useEffect } from 'react';
import apiClient from '@api/apiClient';
import useLoginContext from './useLoginContext';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  tokenUse: 'access',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
});

export default function LoginPage() {
  const { setToken } = useLoginContext();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    async function getToken() {
      const sessionToken = sessionStorage.getItem('token');

      if (sessionToken) {
        try {
          const token = JSON.parse(sessionToken);
          await verifier.verify(token);
          setToken(token);
          navigate('/');
        } catch (error) {
          console.log('Error verifying token:', error);
          sessionStorage.removeItem('token');
        }
      } else if (authCode) {
        try {
          const token = await apiClient.getToken(authCode);
          console.log('Fetched Token:', token);

          sessionStorage.setItem('token', JSON.stringify(token));
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
