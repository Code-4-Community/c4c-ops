import React from 'react';
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

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        height: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 2,
        paddingBottom: 4,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        '::before, ::after': {
          content: '""',
          position: 'absolute',
          width: '10%',
          height: '80%',
          background: 'linear-gradient(180deg, #8A2BE2, #FF00FF, #00FFFF)',
          filter: 'blur(80px)',
          zIndex: 0,
          opacity: 0.8,
        },
        '::before': {
          left: '5%',
          top: '10%',
        },
        '::after': {
          right: '5%',
          top: '10%',
        },
      }}
    >
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
          width: '70%',
          maxWidth: 500,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Welcome back, {fullName || 'User'}!
        </Typography>

        {isLoading ? (
          <CircularProgress sx={{ color: 'white' }} />
        ) : (
          <div>
            {selectedApplication && (
              <>
                <Box
                  sx={{
                    padding: 4,
                    backgroundColor: '#1e1e1e',
                    borderRadius: 2,
                    boxShadow: 2,
                    textAlign: 'center',
                    width: '82%',
                    mb: 3,
                    alignSelf: 'center',
                  }}
                >
                  <Typography variant="h6">Recruitment Stage</Typography>
                  <Typography variant="body1">
                    {selectedApplication.stage}
                  </Typography>
                </Box>

                <Typography variant="h6" mt={2}>
                  Application Details
                </Typography>
                <Box
                  sx={{
                    padding: 4.5,
                    backgroundColor: '#1e1e1e',
                    borderRadius: 2,
                    boxShadow: 2,
                    width: '80%',
                    alignSelf: 'center',
                    mt: 1,
                  }}
                >
                  <Stack
                    spacing={1}
                    direction="column"
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant="body1">
                      Year: {selectedApplication.year}
                    </Typography>
                    <Typography variant="body1">
                      Semester: {selectedApplication.semester}
                    </Typography>
                    <Typography variant="body1">
                      Position: {selectedApplication.position}
                    </Typography>
                    <Typography variant="body1">
                      Stage: {selectedApplication.stage}
                    </Typography>
                    <Typography variant="body1">
                      Status: {selectedApplication.stageProgress}
                    </Typography>
                    <Typography variant="body1">
                      Applications: {selectedApplication.numApps}
                    </Typography>
                  </Stack>
                </Box>

                <Typography variant="h6" mt={2}>
                  Application Responses
                </Typography>
                <List disablePadding dense sx={{ width: '100%' }}>
                  {selectedApplication.response.map((response, index) => (
                    <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                        <DoneOutline sx={{ color: '#4CAF50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Q: ${response.question}`}
                        secondary={
                          <Typography sx={{ color: '#FF4081' }}>
                            {`A: ${response.answer}`}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default ApplicantView;
