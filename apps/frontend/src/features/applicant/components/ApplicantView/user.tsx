import { useEffect, useState } from 'react';
import {
  Typography,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
} from '@mui/material';
import { DoneOutline } from '@mui/icons-material';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import { User } from '@sharedTypes/types/user.types';
import { useApplication } from '@shared/hooks/useApplication';
import { useFullName } from '@shared/hooks/useUserData';
import FileUploadBox from '../FileUploadBox';
import {
  Application,
  ApplicationStage,
  Position,
} from '@sharedTypes/types/application.types';
import { FilePurpose } from '@sharedTypes/types/file-upload.types';

interface ApplicantViewProps {
  user: User;
}

export const ApplicantView = ({ user }: ApplicantViewProps) => {
  const { token: accessToken } = useLoginContext();
  const { application: selectedApplication, isLoading } = useApplication(
    accessToken,
    user.id,
  );
  const { fullName } = useFullName(accessToken);
  const [applicationId, setApplicationId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedApplication?.id) {
      setApplicationId(selectedApplication.id);
    } else {
      setApplicationId(null);
    }
  }, [selectedApplication]);

  // Check if applicant position is PM
  const isPM = selectedApplication?.position === Position.PM;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000',
        position: 'relative',
        py: 4,
        overflow: 'hidden',
        '&::before': {
          content: '"{ }"',
          position: 'fixed',
          top: '15%',
          left: '8%',
          fontSize: '120px',
          color: '#8A2BE2',
          opacity: 0.3,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '"< />"',
          position: 'fixed',
          bottom: '15%',
          right: '8%',
          fontSize: '120px',
          color: '#00FFFF',
          opacity: 0.3,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Gradient Blur Effects */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#121212',
          color: 'white',
          padding: 2,
          borderRadius: 2,
          boxShadow: 2,
          width: { xs: '95%', md: '70%' },
          maxWidth: 900,
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#121212',
            color: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            width: '100%',
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
            Welcome back, {fullName || 'User'}!
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : selectedApplication ? (
            <Stack spacing={3} sx={{ width: '100%' }}>
              <Box
                sx={{
                  padding: 4,
                  backgroundColor: '#1e1e1e',
                  borderRadius: 2,
                  boxShadow: 2,
                  textAlign: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Typography variant="h6">Recruitment Stage</Typography>
                <Typography variant="body1">
                  {selectedApplication.stage}
                </Typography>
              </Box>
              {isPM &&
                String(selectedApplication.stage) ===
                  ApplicationStage.PM_CHALLENGE && (
                  <FileUploadBox
                    accessToken={accessToken}
                    applicationId={applicationId}
                    filePurpose={FilePurpose.PM_CHALLENGE}
                  />
                )}
              <Box>
                <Typography variant="h6" mt={2}>
                  Application Details
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: '#1e1e1e',
                    borderRadius: 2,
                    boxShadow: 2,
                    width: '100%',
                    alignSelf: 'center',
                    mt: 1,
                    boxSizing: 'border-box',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Year
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.year}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Semester
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.semester}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Position
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.position}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Stage
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.stage}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Status
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.stageProgress}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
              {selectedApplication.response &&
                selectedApplication.response.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Application Responses
                    </Typography>
                    <List disablePadding dense>
                      {selectedApplication.response.map((response, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            alignItems: 'flex-start',
                            backgroundColor: '#1e1e1e',
                            borderRadius: 1,
                            mb: 1,
                            p: 2,
                          }}
                        >
                          <ListItemIcon
                            sx={{ minWidth: 'auto', mr: 2, mt: 0.5 }}
                          >
                            <DoneOutline sx={{ color: '#4CAF50' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{ color: '#999', mb: 0.5 }}
                              >
                                {response.question}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body1"
                                sx={{ color: 'white' }}
                              >
                                {response.answer}
                              </Typography>
                            }
                            sx={{ m: 0 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#999' }}>
                No application data available
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ApplicantView;
