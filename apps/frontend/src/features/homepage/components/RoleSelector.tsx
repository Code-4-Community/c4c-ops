import { Box, Button, Stack } from '@mui/material';

type RoleType = 'designer' | 'developer' | 'pm';

interface RoleConfig {
  label: string;
  url: string;
}

const ROLES: Record<RoleType, RoleConfig> = {
  designer: {
    label: 'Designer',
    url: 'https://www.c4cneu.com/apply/Product-Designer',
  },
  developer: {
    label: 'Software Developer',
    url: 'https://www.c4cneu.com/apply/Software-Developer',
  },
  pm: {
    label: 'Product Manager',
    url: 'https://www.c4cneu.com/apply/Product-Manager',
  },
};

/**
 * RoleSelector component
 *
 * Displays the three role options (Designer, Developer, PM) with
 * "Learn More" buttons that open external application pages
 */
export const RoleSelector = () => {
  const handleLearnMore = (role: RoleType) => {
    window.open(ROLES[role].url, '_blank');
  };

  const renderRoleRow = (role: RoleType) => (
    <Box
      key={role}
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
        {ROLES[role].label}
      </Button>
      <Button
        variant="contained"
        onClick={() => handleLearnMore(role)}
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
  );

  return (
    <Box
      sx={{
        backgroundColor: '#3a3a3a',
        borderRadius: '8px',
        padding: '32px',
      }}
    >
      <Stack spacing={3}>
        {renderRoleRow('designer')}
        {renderRoleRow('developer')}
        {renderRoleRow('pm')}
      </Stack>
    </Box>
  );
};
