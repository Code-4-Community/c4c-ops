import { Box, Typography, Stack } from '@mui/material';
import { Application } from '@sharedTypes/types/application.types';

interface ApplicationDetailsCardProps {
  application: Application;
}

export const ApplicationDetailsCard = ({
  application,
}: ApplicationDetailsCardProps) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Application Details
      </Typography>
      <Box
        sx={{
          padding: 3,
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Year
            </Typography>
            <Typography variant="body1">{application.year}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Semester
            </Typography>
            <Typography variant="body1">{application.semester}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Position
            </Typography>
            <Typography variant="body1">{application.position}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Stage
            </Typography>
            <Typography variant="body1">{application.stage}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Status
            </Typography>
            <Typography variant="body1">{application.stageProgress}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Applications
            </Typography>
            <Typography variant="body1">{application.numApps}</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
