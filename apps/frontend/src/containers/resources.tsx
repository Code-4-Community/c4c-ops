import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';
import { Application } from '@components/types';
import {
  StyledPaper,
  StageButton,
  StatusButton,
  ThankYouText,
  DescriptionText,
} from '../components/ApplicantView/ApplicantStatus/items';
import FileUploadBox from './fileUploadBox';

const Resources: React.FC = () => {
  const { token: accessToken } = useLoginContext();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState<number | null>(null);

  const getApplication = async (userId: number) => {
    try {
      const application = await apiClient.getApplication(accessToken, userId);
      setApp(application);
      setApplicationId(application.id);
      return application;
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to fetch application details.');
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const data = await apiClient.getAllApplications(accessToken);
      if (data && data.length > 0) {
        const application = await getApplication(data[0].userId);
        if (application) {
          setApp(application);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const formatStage = (stage: string) => {
    switch (stage) {
      case 'PM_CHALLENGE':
        return 'PM Challenge';
      case 'INTERVIEW':
        return 'Interview';
      case 'FINAL_REVIEW':
        return 'Final Review';
      default:
        return stage
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const formatReviewStatus = (review: string) => {
    switch (review) {
      case 'IN_REVIEW':
        return 'In Review';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      default:
        return review
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 3, backgroundColor: '#2A2A2A', minHeight: '100vh' }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: 'white', mb: 4 }}
        >
          Resources
        </Typography>

        {!loading && app && (
          <StyledPaper elevation={3}>
            <Typography
              variant="body1"
              sx={{ color: 'white', mb: 2, fontSize: '1.1rem' }}
            >
              Application Stage:
            </Typography>

            <StageButton>{formatStage(app.stage.toString())}</StageButton>

            <Typography
              variant="body1"
              sx={{ color: 'white', mb: 2, fontSize: '1.1rem' }}
            >
              Application Status:
            </Typography>

            <StatusButton>{formatReviewStatus(app.review)}</StatusButton>

            <ThankYouText variant="body1">Thank you for applying!</ThankYouText>

            <DescriptionText variant="body2">
              Our team is working diligently to review your applications. Please
              look out for emails from C4C for updates.
            </DescriptionText>
          </StyledPaper>
        )}

        {!loading && !app && (
          <StyledPaper elevation={3}>
            <Typography
              variant="body1"
              sx={{ color: 'white', textAlign: 'center' }}
            >
              No application found.
            </Typography>
          </StyledPaper>
        )}

        {loading && (
          <StyledPaper elevation={3}>
            <Typography
              variant="body1"
              sx={{ color: 'white', textAlign: 'center' }}
            >
              Loading application details...
            </Typography>
          </StyledPaper>
        )}
      </Box>
      {!loading && app && String(app.stage) === 'PM_CHALLENGE' && (
        <FileUploadBox
          accessToken={accessToken}
          applicationId={applicationId}
        />
      )}
    </Container>
  );
};

export default Resources;
