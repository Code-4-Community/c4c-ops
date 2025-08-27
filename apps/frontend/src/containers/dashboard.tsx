import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
