import React, { useState, useEffect } from 'react';
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
import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';
import { Application, User } from '../types';

interface ApplicantViewProps {
  user: User;
}

export const ApplicantView = ({ user }: ApplicantViewProps) => {
  const { token: accessToken } = useLoginContext();
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApplication = async (userId: number) => {
      try {
        const application = await apiClient.getApplication(accessToken, userId);
        setSelectedApplication(application);
      } catch (error) {
        console.error('Error fetching application:', error);
        alert('Failed to fetch application details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFullName = async () => {
      try {
        const name = await apiClient.getFullName(accessToken);
        setFullName(name);
      } catch (error) {
        console.error('Error fetching full name:', error);
      }
    };

    fetchApplication(user.id);
    fetchFullName();
  }, [accessToken, user.id]);

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        '::before, ::after': {
          content: '""',
          position: 'absolute',
          width: 200,
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
          padding: 3,
          borderRadius: 2,
          boxShadow: 2,
          width: '80%',
          maxWidth: 600,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Welcome back, {fullName || 'User'}!
        </Typography>

        {loading ? (
          <CircularProgress sx={{ color: 'white' }} />
        ) : (
          <div>
            {selectedApplication && (
              <>
                <Box
                  sx={{
                    padding: 3,
                    backgroundColor: '#1e1e1e',
                    borderRadius: 2,
                    boxShadow: 2,
                    textAlign: 'center',
                    width: '100%',
                    mb: 3,
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
                <Stack spacing={2} direction="row" mt={1}>
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
                    Status: {selectedApplication.step}
                  </Typography>
                  <Typography variant="body1">
                    Applications: {selectedApplication.numApps}
                  </Typography>
                </Stack>

                <Typography variant="h6" mt={2}>
                  Application Responses
                </Typography>
                <List disablePadding dense>
                  {selectedApplication.response.map((response, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <DoneOutline sx={{ color: '#4CAF50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Q: ${response.question}`}
                        secondary={
                          <Typography sx={{ color: '#FF4081' }}>
                            {`A: ${response.answer}`}
                          </Typography>
                        }
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
