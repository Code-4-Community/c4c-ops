import { Box, Typography } from '@mui/material';

/**
 * WelcomeBanner component
 *
 * Displays the welcome message and application instructions
 */
export const WelcomeBanner = () => {
  return (
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
        Apply as a Developer, Designer, or Project Manager{' '}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScGimGWc9CGy9gGsGOVzPCyM3hapgg94IPU2LA6qSk0SR3F2Q/viewform?usp=sharing&ouid=114299777948262504771"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#4a5fa8',
            textDecoration: 'underline',
            fontWeight: 600,
          }}
        >
          here
        </a>
        .
      </Typography>
    </Box>
  );
};
