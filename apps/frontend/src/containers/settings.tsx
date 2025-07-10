import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
      </Box>
    </Container>
  );
};

export default Settings;
