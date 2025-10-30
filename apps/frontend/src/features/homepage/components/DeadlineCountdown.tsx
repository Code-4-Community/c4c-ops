import { Box, Typography } from '@mui/material';
import { useCountdown } from '../hooks/useCountdown';

interface DeadlineCountdownProps {
  deadline: Date;
}

/**
 * DeadlineCountdown component
 *
 * Displays a countdown timer to the application deadline
 *
 * @param deadline - The application deadline date
 */
export const DeadlineCountdown = ({ deadline }: DeadlineCountdownProps) => {
  const timeLeft = useCountdown(deadline.getTime());

  const formatTime = (value: number) => String(value).padStart(2, '0');

  return (
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
        Deadline:{' '}
        {deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>

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
          {formatTime(timeLeft.days)} days, {formatTime(timeLeft.hours)} hours,{' '}
          {formatTime(timeLeft.minutes)} minutes, and{' '}
          {formatTime(timeLeft.seconds)} seconds left!
        </Typography>
      </Box>
    </Box>
  );
};
