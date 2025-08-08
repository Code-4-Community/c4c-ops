import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#404040',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  maxWidth: 700,
  textAlign: 'left',
}));

export const StageButton = styled(Box)(({ theme }) => ({
  backgroundColor: '#C2185B',
  color: 'white',
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(0.5),
  textAlign: 'left',
  fontWeight: 900,
  fontSize: '1.1rem',
  marginBottom: theme.spacing(2),
  width: '45%',
}));

export const StatusButton = styled(Box)(({ theme }) => ({
  backgroundColor: '#C2185B',
  color: 'white',
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(0.5),
  textAlign: 'left',
  fontWeight: 900,
  fontSize: '1.1rem',
  marginBottom: theme.spacing(3),
  width: '45%',
}));

export const ThankYouText = styled(Typography)(({ theme }) => ({
  color: 'white',
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '1.1rem',
}));

export const DescriptionText = styled(Typography)(({ theme }) => ({
  color: '#E0E0E0',
  fontSize: '1rem',
  lineHeight: 1.5,
}));
