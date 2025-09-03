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
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Application, AssignedRecruiter, User } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  MailOutline,
  DescriptionOutlined,
  NoteAltOutlined,
  Close,
  StickyNote2Outlined,
} from '@mui/icons-material';
import apiClient from '@api/apiClient';
import { Decision } from '@components/types';
import { AssignedRecruiters } from './AssignedRecruiters';

type IndividualApplicationDetailsProps = {
  selectedApplication: Application;
  selectedUser: User;
  accessToken: string;
};

interface ReviewData {
  numReviews: number;
}

interface ReviewerInfo {
  [key: number]: string;
}

const reviewData: ReviewData = {
  numReviews: 5,
};

const IndividualApplicationDetails = ({
  selectedApplication,
  selectedUser,
  accessToken,
}: IndividualApplicationDetailsProps) => {
  const [assignedRecruiters, setAssignedRecruiters] = useState<
    AssignedRecruiter[]
  >([]);
  const [allRecruiters, setAllRecruiters] = useState<AssignedRecruiter[]>([]);
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<number[]>(
    [],
  );

  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reviewerNames, setReviewerNames] = useState<ReviewerInfo>({});

  const navigate = useNavigate();

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

    if (!selectedUser || ((!reviewRating || !reviewComment) && !decision)) {
      alert('Please provide both a rating and comment, or a decision.');
      return;
    }

    try {
      // Submit review
      if (reviewRating && reviewComment) {
        await apiClient.submitReview(accessToken, {
          applicantId: selectedUser.id,
          stage: selectedApplication.stage,
          rating: reviewRating,
          content: reviewComment,
        });
      }

      // Submit decision
      if (decision) {
        await apiClient.submitDecision(accessToken, selectedUser.id, {
          decision: decision,
        });
      }

      alert('Submitted successfully!');

      // Reset form
      setReviewRating(null);
      setReviewComment('');
      setDecision(null);
    } catch (error) {
      console.error('Error submitting review or decision:', error);
      alert('Failed to submit review or decision.');
    }
  };

  // Fetch all available recruiters
  const fetchAllRecruiters = async () => {
    try {
      const recruiters = await apiClient.getAllRecruiters(accessToken);
      setAllRecruiters(recruiters);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    }
  };

  // Initialize selected recruiters from props
  useEffect(() => {
    const assignedIds = assignedRecruiters.map((recruiter) => recruiter.id);
    setSelectedRecruiterIds(assignedIds);
  }, [assignedRecruiters]);

  // Fetch all available recruiters
  useEffect(() => {
    fetchAllRecruiters();
  }, [accessToken]);

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
    <Stack direction="column">
      {/* Top section with the user's name and links + app stage, assigned to, review step*/}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* Logo + Name + information*/}
        <Stack direction="column">
          <Stack direction="row" alignItems="center" spacing={2}>
            <img
              src="/c4clogo.png"
              alt="C4C Logo"
              style={{ width: 50, height: 40 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', color: 'white' }}
            >
              {selectedUser.firstName} {selectedUser.lastName} |{' '}
              {selectedApplication.position || 'No Position'}
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
              color: '#ccc !important',
            }}
          >
            {/* Make this with the correct links/information */}
            <MailOutline sx={{ color: '#ccc' }} /> Email
            <NoteAltOutlined sx={{ color: '#ccc' }} /> Overview
            <DescriptionOutlined sx={{ color: '#ccc' }} /> Application
            <StickyNote2Outlined sx={{ color: '#ccc' }} /> Interview Notes
          </Typography>
        </Stack>
        <Button variant="text" size="small" onClick={handleClose}>
          <Close />
        </Button>
      </Stack>
      <Stack direction="column" spacing={2} my={2} sx={{ width: '50%' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1">App Stage: </Typography>
          <Select
            size="small"
            value={selectedApplication.stage}
            sx={{
              color: 'white',
              backgroundColor: 'gray',
              minWidth: '75%',
            }}
          >
            <MenuItem value={selectedApplication.stage}>
              {selectedApplication.stage}
            </MenuItem>
          </Select>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1">Assigned To: </Typography>
          <Stack direction="row" alignItems="center" sx={{ minWidth: '75%' }}>
            <AssignedRecruiters
              applicationId={selectedApplication.id}
              assignedRecruiters={selectedApplication.assignedRecruiters}
              onRecruitersChange={(recruiterIds) => {
                const selectedRecruiters = allRecruiters.filter((recruiter) =>
                  recruiterIds.includes(recruiter.id),
                );
                setAssignedRecruiters(selectedRecruiters);
              }}
            />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1">Review Step: </Typography>
          <Select
            size="small"
            value={selectedApplication.step}
            sx={{
              color: 'white',
              backgroundColor: 'gray',
              minWidth: '75%',
            }}
          >
            <MenuItem value={selectedApplication.step}>
              {selectedApplication.step}
            </MenuItem>
          </Select>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Stack
          direction="column"
          sx={{ flex: 2, border: '1px solid #6225b0', borderRadius: 1, p: 2 }}
        >
          <Typography variant="h5" textAlign="center">
            Application Response
          </Typography>
          <Divider sx={{ my: 2, borderColor: '#ccc' }} />
          {selectedApplication.response.map((response, index) => (
            <Stack direction="column">
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {index + 1}. {response.question}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {response.answer}
              </Typography>
              <Divider sx={{ my: 2, borderColor: '#ccc' }} />
            </Stack>
          ))}
        </Stack>
        <Stack direction="column" sx={{ flex: 1 }}>
          <Stack
            direction="column"
            sx={{ border: '1px solid #6225b0', borderRadius: 1, p: 2 }}
          >
            <Typography variant="h5" textAlign="center">
              Recruiter Review
            </Typography>
            <Divider sx={{ my: 2, borderColor: '#ccc' }} />
            <Box
              component="form"
              onSubmit={handleFormSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl size="small">
                <FormLabel sx={{ color: '#ccc' }}>Rating</FormLabel>
                <Select
                  value={reviewRating?.toString() || ''}
                  onChange={(e) => handleRatingChange(e.target.value)}
                  sx={{
                    color: 'white',
                    border: '1px solid white',
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
                <FormLabel sx={{ color: '#ccc' }}>
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
                    color: 'white',
                    border: '1px solid white',
                  }}
                >
                  <MenuItem value="N/A">N/A</MenuItem>
                  <MenuItem value={Decision.ACCEPT}>Accept</MenuItem>
                  <MenuItem value={Decision.REJECT}>Reject</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <FormLabel sx={{ color: '#ccc' }}>Comments</FormLabel>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  sx={{
                    border: '1px solid #ccc',
                    color: '#white',
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
                }}
              >
                Submit
              </Button>
            </Box>
            <Divider sx={{ my: 2, borderColor: '#ccc' }} />
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
                          backgroundColor: 'gray',
                          borderRadius: 1,
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
        </Stack>
      </Stack>
    </Stack>
  );
};

export default IndividualApplicationDetails;
