import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const HomePage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Hardcoded deadline: October 31, 2025
  const deadline = new Date('2025-10-31T23:59:59').getTime();

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

  return (
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
        {/* <AccountCircle sx={{ fontSize: 40, color: '#ffffff' }} /> */}
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
                  gridTemplateColumns: '2fr 1fr',
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
                  gridTemplateColumns: '2fr 1fr',
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
                  gridTemplateColumns: '2fr 1fr',
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
  );
};

export default HomePage;
