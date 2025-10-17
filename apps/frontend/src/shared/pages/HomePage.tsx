import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import apiClient from '@api/apiClient';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';

const verifier = CognitoJwtVerifier.create({
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  tokenUse: 'access',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
});

const HomePage = () => {
  const navigate = useNavigate();
  const { setToken, token } = useLoginContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Hardcoded deadline: October 31, 2025
  const deadline = new Date('2025-10-31T23:59:59').getTime();

  // Authentication logic - handle auth code and token verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    async function handleAuth() {
      const sessionToken = sessionStorage.getItem('token');

      if (sessionToken) {
        try {
          const token = JSON.parse(sessionToken);
          await verifier.verify(token);
          setToken(token);
          setIsAuthenticated(true);
          // Don't navigate away - let them stay on the home page
        } catch (error) {
          console.log('Error verifying token:', error);
          sessionStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else if (authCode) {
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
          setIsAuthenticated(true);

          // Redirect to dashboard after successful login from Cognito
          navigate('/');
        } catch (error) {
          console.error('Error fetching token:', error);
          setIsAuthenticated(false);
        }
      } else {
        // No token and no auth code - user is not authenticated
        setIsAuthenticated(false);
      }
    }
    handleAuth();
  }, [navigate, setToken]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const formatTime = (value: number) => String(value).padStart(2, '0');

  const handleLearnMore = (role: string) => {
    const urls: { [key: string]: string } = {
      designer: 'https://www.c4cneu.com/apply/Product-Designer',
      developer: 'https://www.c4cneu.com/apply/Software-Developer',
      pm: 'https://www.c4cneu.com/apply/Product-Manager',
    };
    window.open(urls[role], '_blank');
  };

  const handleSignOut = () => {
    // Clear all authentication data
    sessionStorage.removeItem('token');
    localStorage.removeItem('auth_tokens');
    setToken('');
    setIsAuthenticated(false);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#181818',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 40px',
            borderBottom: '1px solid #2a2a2a',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src="/c4clogo.png"
              alt="C4C Logo"
              style={{ height: '40px', width: 'auto' }}
            />
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              2025 Application
            </Typography>
          </Box>
          {isAuthenticated ? (
            <Button
              variant="contained"
              onClick={handleSignOut}
              sx={{
                backgroundColor: '#6e6e6e !important',
                color: '#ffffff !important',
                fontSize: '16px',
                fontWeight: 600,
                padding: '10px 24px',
                textTransform: 'none',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: '#5a5a5a !important',
                },
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              variant="contained"
              href="https://scaffolding.auth.us-east-2.amazoncognito.com/login?client_id=4c5b8m6tno9fvljmseqgmk82fv&response_type=code&scope=email+openid&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin"
              sx={{
                backgroundColor: '#4a5fa8 !important',
                color: '#ffffff !important',
                fontSize: '16px',
                fontWeight: 600,
                padding: '10px 24px',
                textTransform: 'none',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: '#3d4f8f !important',
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ flex: 1, py: 8 }}>
          <Stack spacing={4}>
            {/* Welcome Banner */}
            <Box
              sx={{
                backgroundColor: '#3a3a3a',
                borderRadius: '8px',
                padding: '48px 32px',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  marginBottom: 2,
                  color: '#ffffff !important',
                }}
              >
                Welcome to the C4C Application page!
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: '#cccccc !important', fontWeight: 400 }}
              >
                Apply as a Developer, Designer, or Project Manager here.
              </Typography>
            </Box>

            {/* Role Buttons */}
            <Box
              sx={{
                backgroundColor: '#3a3a3a',
                borderRadius: '8px',
                padding: '32px',
              }}
            >
              <Stack spacing={3}>
                {/* Designer Row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#4a5fa8 !important',
                      color: '#ffffff !important',
                      fontSize: '18px',
                      fontWeight: 600,
                      padding: '16px 32px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#3d4f8f !important',
                      },
                    }}
                  >
                    Designer
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleLearnMore('designer')}
                    sx={{
                      backgroundColor: '#6e6e6e !important',
                      color: '#ffffff !important',
                      fontSize: '18px',
                      fontWeight: 600,
                      padding: '16px 32px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#5a5a5a !important',
                      },
                    }}
                  >
                    Learn More →
                  </Button>
                </Box>

                {/* Software Developer Row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#4a5fa8 !important',
                      color: '#ffffff !important',
                      fontSize: '18px',
                      fontWeight: 600,
                      padding: '16px 32px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#3d4f8f !important',
                      },
                    }}
                  >
                    Software Developer
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleLearnMore('developer')}
                    sx={{
                      backgroundColor: '#6e6e6e !important',
                      color: '#ffffff !important',
                      fontSize: '18px',
                      fontWeight: 600,
                      padding: '16px 32px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#5a5a5a !important',
                      },
                    }}
                  >
                    Learn More →
                  </Button>
                </Box>

                {/* Product Manager Row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#4a5fa8 !important',
                      color: '#ffffff !important',
                      fontSize: '18px',
                      fontWeight: 600,
                      padding: '16px 32px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#3d4f8f !important',
                      },
                    }}
                  >
                    Product Manager
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleLearnMore('pm')}
                    sx={{
                      backgroundColor: '#6e6e6e !important',
                      color: '#ffffff !important',
                      fontSize: '18px',
                      fontWeight: 600,
                      padding: '16px 32px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#5a5a5a !important',
                      },
                    }}
                  >
                    Learn More →
                  </Button>
                </Box>
              </Stack>
            </Box>

            {/* Deadline Section */}
            <Box
              sx={{
                backgroundColor: '#3a3a3a',
                borderRadius: '8px',
                padding: '40px 32px',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  marginBottom: 3,
                  color: '#ffffff !important',
                }}
              >
                Deadline: October 31, 2025
              </Typography>

              {/* Countdown Timer */}
              <Box
                sx={{
                  backgroundColor: '#7b4db8',
                  borderRadius: '8px',
                  padding: '32px',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#ffffff !important',
                    letterSpacing: '2px',
                  }}
                >
                  {formatTime(timeLeft.days)} days, {formatTime(timeLeft.hours)}{' '}
                  hours, {formatTime(timeLeft.minutes)} minutes, and{' '}
                  {formatTime(timeLeft.seconds)} seconds left!
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
