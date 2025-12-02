import {
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  FormControl,
  FormLabel,
  Divider,
  Card,
  Grid,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Application, Decision } from '@sharedTypes/types/application.types';
import { User } from '@sharedTypes/types/user.types';
import { useNavigate } from 'react-router-dom';
import {
  MailOutline,
  DescriptionOutlined,
  NoteAltOutlined,
  Close,
  StickyNote2Outlined,
} from '@mui/icons-material';
import apiClient from '@api/apiClient';
import { AssignedRecruiters } from './AssignedRecruiters';
import { LOGO_PATHS } from '@constants/recruitment';
import { useUserData } from '@shared/hooks/useUserData';
import CodeAmbientBackground from '../../components/CodeAmbientBackground';

type IndividualApplicationDetailsProps = {
  selectedApplication: Application;
  selectedUser: User;
  accessToken: string;
  onRefreshApplication?: () => Promise<void>;
};

interface ReviewerInfo {
  [key: number]: string;
}

const IndividualApplicationDetails = ({
  selectedApplication,
  selectedUser,
  accessToken,
  onRefreshApplication,
}: IndividualApplicationDetailsProps) => {
  console.log('Full selectedApplication:', selectedApplication);
  console.log('Reviews array:', selectedApplication.reviews);

  // Lighter purple accent tuned to match Figma palette
  const ACCENT = '#9B6CFF';
  // Assigned recruiters are managed by the AssignedRecruiters child component

  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reviewerNames, setReviewerNames] = useState<ReviewerInfo>({});

  const navigate = useNavigate();

  const { user: currentUser, isLoading: isUserLoading } =
    useUserData(accessToken);
  const isAdmin = currentUser?.status === 'Admin';

  const handleClose = () => {
    navigate('/applications');
  };

  const handleRatingChange = (value: string) => {
    setReviewRating(value === '' ? null : Number(value));
  };

  const handleDecisionChange = (newDecision: Decision | null) => {
    setDecision(newDecision);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedComment = reviewComment.trim();

    if (
      !selectedUser ||
      ((!reviewRating || trimmedComment === '') && !decision)
    ) {
      alert(
        'Please provide both a rating and a non-empty comment, or make a decision.',
      );
      return;
    }

    try {
      if (currentUser == null) {
        throw new Error(
          'the current user should not be null when trying to submit a review',
        );
      }

      // Submit review
      if (reviewRating && trimmedComment) {
        await apiClient.submitReview(accessToken, {
          applicantId: selectedUser.id,
          stage: selectedApplication.stage,
          rating: reviewRating,
          content: trimmedComment,
        });
      }

      // Submit decision
      if (decision) {
        await apiClient.submitDecision(accessToken, selectedUser.id, decision);
      }

      alert('Submitted successfully!');

      if (onRefreshApplication) {
        await onRefreshApplication();
      }

      // Reset form
      setReviewRating(null);
      setReviewComment('');
      setDecision(null);
    } catch (error) {
      console.error('Error submitting review or decision:', error);
      alert('Failed to submit review or decision.');
    }
  };

  // (Recruiters fetching moved into AssignedRecruiters component)

  // Fetch reviewer names
  useEffect(() => {
    const fetchReviewerNames = async () => {
      const names: ReviewerInfo = {};
      for (const review of selectedApplication.reviews) {
        try {
          const user = await apiClient.getUserById(
            accessToken,
            review.reviewerId,
          );
          names[review.reviewerId] = `${user.firstName} ${user.lastName}`;
        } catch (error) {
          console.error('Error fetching reviewer name:', error);
          names[review.reviewerId] = 'Unknown User';
        }
      }
      setReviewerNames(names);
    };

    if (selectedApplication.reviews.length > 0) {
      fetchReviewerNames();
    }
  }, [selectedApplication.reviews, accessToken]);

  return (
    <Stack
      direction="column"
      sx={{
        gap: 2,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        color: '#fff',
        textShadow: '0 1px 1px rgba(0,0,0,0.25)',
        position: 'relative',
      }}
      className="bubbly-font"
    >
      <CodeAmbientBackground opacity={0.14} />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Top section with the user's name and links + app stage, assigned to, review step*/}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: alpha(ACCENT, 0.12),
            border: `1px solid ${alpha(ACCENT, 0.5)}`,
            borderRadius: 1.5,
            p: { xs: 1.5, md: 2 },
            mb: 1.5,
          }}
        >
          {/* Logo + Name + information*/}
          <Stack direction="column" spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <img
                src={LOGO_PATHS.STANDARD}
                alt="C4C Logo"
                style={{ width: 50, height: 40 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                {selectedUser.firstName} {selectedUser.lastName} |{' '}
                {selectedApplication.position || 'No Position'}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Make this with the correct links/information */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: alpha(ACCENT, 0.25),
                }}
              >
                <MailOutline fontSize="small" />
                <Typography variant="body2">
                  {selectedUser.email ?? 'Email'}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: alpha(ACCENT, 0.25),
                }}
              >
                <NoteAltOutlined fontSize="small" />
                <Typography variant="body2">Overview</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: alpha(ACCENT, 0.25),
                }}
              >
                <DescriptionOutlined fontSize="small" />
                <Typography variant="body2">Application</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: alpha(ACCENT, 0.25),
                }}
              >
                <StickyNote2Outlined fontSize="small" />
                <Typography variant="body2">Interview Notes</Typography>
              </Stack>
            </Stack>
          </Stack>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleClose}
            sx={{ borderColor: alpha(ACCENT, 0.6) }}
          >
            <Close />
          </Button>
        </Stack>
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(ACCENT, 0.35)}`,
            backgroundColor: 'transparent',
            p: { xs: 2, md: 2.5 },
            maxWidth: 900,
            alignSelf: 'center',
            width: '100%',
            mt: 1,
          }}
        >
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <FormControl size="small" fullWidth>
                <FormLabel sx={{ color: '#fff' }}>App Stage</FormLabel>
                <Select
                  value={selectedApplication.stage}
                  fullWidth
                  sx={{
                    border: `1px solid ${alpha(ACCENT, 0.4)}`,
                    color: '#fff',
                    '.MuiSelect-icon': { color: '#fff' },
                  }}
                >
                  <MenuItem value={selectedApplication.stage}>
                    {selectedApplication.stage}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl size="small" fullWidth>
                <FormLabel sx={{ color: '#fff' }}>Review Step</FormLabel>
                <Select
                  value={selectedApplication.stageProgress}
                  fullWidth
                  sx={{
                    border: `1px solid ${alpha(ACCENT, 0.4)}`,
                    color: '#fff',
                    '.MuiSelect-icon': { color: '#fff' },
                  }}
                >
                  <MenuItem value={selectedApplication.stageProgress}>
                    {selectedApplication.stageProgress}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <FormLabel sx={{ color: '#fff' }}>Assigned To</FormLabel>
                <Box>
                  {isAdmin ? (
                    <AssignedRecruiters
                      applicationId={selectedApplication.id}
                      assignedRecruiters={
                        selectedApplication.assignedRecruiters
                      }
                    />
                  ) : (
                    <Typography sx={{ color: '#fff', mt: 1 }}>
                      {selectedApplication.assignedRecruiters
                        .map((r) => `${r.firstName} ${r.lastName}`)
                        .join(', ') || 'Unassigned'}
                    </Typography>
                  )}
                </Box>
              </FormControl>
            </Grid>
          </Grid>
        </Card>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={8}>
            <Stack
              direction="column"
              sx={{
                border: `1px solid ${alpha(ACCENT, 0.35)}`,
                borderRadius: 1.5,
                p: { xs: 2, md: 2.5 },
                backgroundColor: 'transparent',
                gap: 1,
                mt: 2,
              }}
            >
              <Typography
                variant="h6"
                textAlign="center"
                sx={{ fontWeight: 700, color: '#fff' }}
              >
                Application Response
              </Typography>
              <Divider sx={{ my: 1.5, borderColor: alpha(ACCENT, 0.25) }} />
              {selectedApplication.response.map((response, index) => (
                <Stack direction="column" key={index} sx={{ py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {index + 1}. {response.question}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}
                  >
                    {response.answer}
                  </Typography>
                  {index < selectedApplication.response.length - 1 && (
                    <Divider
                      sx={{ mt: 1.5, borderColor: alpha(ACCENT, 0.2) }}
                    />
                  )}
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={{ mt: { md: -25 } }}>
            <Stack
              direction="column"
              sx={{
                border: `1px solid ${alpha(ACCENT, 0.35)}`,
                borderRadius: 1.5,
                p: { xs: 2, md: 2.5 },
                backgroundColor: 'transparent',
                gap: 1.5,
                position: { md: 'sticky' },
                top: { md: -104 },
              }}
            >
              <Typography
                variant="h6"
                textAlign="center"
                sx={{ fontWeight: 700, color: '#fff' }}
              >
                Recruiter Review
              </Typography>
              <Divider sx={{ my: 1.5, borderColor: alpha(ACCENT, 0.25) }} />
              <Box
                component="form"
                onSubmit={handleFormSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <FormControl size="small">
                  <FormLabel sx={{ color: '#fff' }}>Rating</FormLabel>
                  <Select
                    value={reviewRating?.toString() || ''}
                    onChange={(e) => handleRatingChange(e.target.value)}
                    sx={{
                      border: `1px solid ${alpha(ACCENT, 0.4)}`,
                      color: '#fff',
                      '.MuiSelect-icon': { color: '#fff' },
                    }}
                  >
                    <MenuItem value="">N/A</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <FormLabel sx={{ color: '#fff' }}>
                    Final Recommendation
                  </FormLabel>
                  <Select
                    value={decision || ''}
                    onChange={(e) =>
                      handleDecisionChange(
                        e.target.value === 'N/A'
                          ? null
                          : (e.target.value as Decision),
                      )
                    }
                    sx={{
                      border: `1px solid ${alpha(ACCENT, 0.4)}`,
                      color: '#fff',
                      '.MuiSelect-icon': { color: '#fff' },
                    }}
                  >
                    <MenuItem value="N/A">N/A</MenuItem>
                    <MenuItem value={Decision.ACCEPT}>Accept</MenuItem>
                    <MenuItem value={Decision.REJECT}>Reject</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <FormLabel sx={{ color: '#fff' }}>Comments</FormLabel>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root fieldset': {
                        borderColor: alpha(ACCENT, 0.4),
                      },
                      '& .MuiInputBase-input': { color: '#fff' },
                    }}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  type="submit"
                  sx={{
                    alignSelf: 'flex-end',
                    width: 'fit-content',
                    minWidth: '100px',
                    bgcolor: ACCENT,
                    '&:hover': { bgcolor: alpha(ACCENT, 0.9) },
                  }}
                >
                  Submit
                </Button>
              </Box>
              <Divider sx={{ my: 1.5, borderColor: alpha(ACCENT, 0.25) }} />
              <Stack>
                <Typography variant="h6">Reviews</Typography>
                {selectedApplication.reviews.length > 0 ? (
                  selectedApplication.reviews.map((review, index) => {
                    return (
                      <Stack key={index} direction="column">
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">
                            Name:{' '}
                            {reviewerNames[review.reviewerId] || 'Loading...'}
                          </Typography>
                          <Typography variant="body2">
                            {new Date(review.createdAt).toLocaleDateString()} |{' '}
                            {new Date(review.createdAt).toLocaleTimeString(
                              'en-US',
                              { hour12: false },
                            )}
                          </Typography>
                        </Stack>
                        <Card
                          sx={{
                            backgroundColor: 'transparent',
                            borderRadius: 1,
                            border: `1px solid ${alpha(ACCENT, 0.25)}`,
                            p: 1,
                          }}
                        >
                          <Stack direction="column">
                            <Typography variant="body2">
                              {review.rating}/{review.stage}
                            </Typography>
                            <Typography variant="body2">
                              Comment: {review.content}
                            </Typography>
                          </Stack>
                        </Card>
                      </Stack>
                    );
                  })
                ) : (
                  <Typography variant="body2">No reviews yet</Typography>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};

export default IndividualApplicationDetails;
