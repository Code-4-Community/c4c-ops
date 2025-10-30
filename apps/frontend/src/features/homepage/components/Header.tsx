import { Box, Button, Typography } from '@mui/material';

interface HeaderProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

/**
 * Header component for the home page
 *
 * Displays the C4C logo, application title, and auth button
 * Shows "Sign Out" for authenticated users, "Login" for guests
 */
export const Header = ({ isAuthenticated, onSignOut }: HeaderProps) => {
  return (
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
          onClick={onSignOut}
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
  );
};
