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
        Apply as a Developer, Designer, or Project Manager here.
      </Typography>
    </Box>
  );
};
