import { Box, Container, Stack } from '@mui/material';
import { useAuth } from '@shared/hooks/useAuth';
import {
  Header,
  WelcomeBanner,
  RoleSelector,
  DeadlineCountdown,
} from '@features/homepage/components';

/**
 * HomePage - Application landing page
 *
 * Clean, presentational component that composes smaller, reusable components.
 * Authentication logic is delegated to the useAuth hook.
 *
 * Responsibilities:
 * - Display welcome banner
 * - Show role selection options
 * - Display application deadline countdown
 * - Show login/logout based on authentication state
 */
const HomePage = () => {
  const { isAuthenticated, signOut } = useAuth();

  // Application deadline
  const deadline = new Date('2025-10-31T23:59:59');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#181818',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header isAuthenticated={isAuthenticated} onSignOut={signOut} />

      <Container maxWidth="md" sx={{ flex: 1, py: 8 }}>
        <Stack spacing={4}>
          <WelcomeBanner />
          <RoleSelector />
          <DeadlineCountdown deadline={deadline} />
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
