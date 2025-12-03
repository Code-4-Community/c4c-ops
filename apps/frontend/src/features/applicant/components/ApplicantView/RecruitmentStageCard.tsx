import { Box, Typography } from '@mui/material';

interface RecruitmentStageCardProps {
  stage: string;
}

export const RecruitmentStageCard = ({ stage }: RecruitmentStageCardProps) => {
  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#1e1e1e',
        borderRadius: 2,
        boxShadow: 2,
        textAlign: 'center',
        mb: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Recruitment Stage
      </Typography>
      <Typography variant="body1" sx={{ color: '#90caf9' }}>
        {stage}
      </Typography>
    </Box>
  );
};
