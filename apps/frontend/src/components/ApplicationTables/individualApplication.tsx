import {
  Typography,
  Stack,
  List,
  ListItem,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  FormControl,
  FormLabel,
  Divider,
  Rating,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Application, ApplicationRow, AssignedRecruiter } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  MailOutline,
  DescriptionOutlined,
  NoteAltOutlined,
  Close,
} from '@mui/icons-material';
import apiClient from '@api/apiClient';
import { Decision } from '@components/types';

type IndividualApplicationDetailsProps = {
  selectedApplication: Application;
  selectedUserRow: ApplicationRow;
  accessToken: string;
};

interface ReviewData {
  numReviews: number;
}

const reviewData: ReviewData = {
  numReviews: 5,
};

const IndividualApplicationDetails = ({
  selectedApplication,
  selectedUserRow,
  accessToken,
}: IndividualApplicationDetailsProps) => {
  const [assignedRecruiters, setAssignedRecruiters] = useState<
    AssignedRecruiter[]
  >([]);
  const [allRecruiters, setAllRecruiters] = useState<AssignedRecruiter[]>([]);
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<number[]>(
    [],
  );
  const [reviewRating, setReviewRating] = useState<number[]>(
    Array(reviewData.numReviews).fill(0),
  );
  const [reviewComment, setReviewComment] = useState('');
  const [decision, setDecision] = useState<Decision | ''>('');

  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/applications');
  };

  const handleRatingChange = (index: number, value: number | null) => {
    const newRatings = [...reviewRating];
    newRatings[index] = value || 0;
    setReviewRating(newRatings);
  };

  const handleDecisionChange = (newDecision: Decision) => {
    setDecision(newDecision);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const totalRatings = reviewRating.reduce((sum, rating) => sum + rating, 0);
    const averageRating = Number(
      (totalRatings / reviewRating.length).toFixed(1),
    );

    const concatenatedComments = reviewRating
      .map((rating, index) => `Review ${index + 1}: ${rating}`)
      .join(', ');

    if (
      !selectedUserRow ||
      reviewRating.some((rating) => rating === 0) ||
      !reviewComment ||
      !decision
    ) {
      alert('Please provide all ratings, a comment, and a decision.');
      return;
    }

    try {
      // Submit review
      await apiClient.submitReview(accessToken, {
        applicantId: selectedUserRow.userId,
        stage: selectedApplication.stage,
        rating: Number(averageRating.toFixed(1)),
        content: `${reviewComment} | ${concatenatedComments}`,
      });

      // Submit decision
      await apiClient.submitDecision(accessToken, selectedUserRow.userId, {
        decision: decision,
      });

      alert('Review and decision submitted successfully!');

      // Reset form
      setReviewRating(Array(reviewData.numReviews).fill(0));
      setReviewComment('');
      setDecision('');
    } catch (error) {
      console.error('Error submitting review and decision:', error);
      alert('Failed to submit review and decision.');
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

  return (
    <Stack direction="column">
      {/* Top section with the user's name and links + app stage, assigned to, review step*/}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        {/* Logo + Name + information*/}
        <Stack direction="column">
          <Stack direction="row" alignItems="center">
            <img
              src="/c4clogo.png"
              alt="C4C Logo"
              style={{ width: 50, height: 40 }}
            />
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', color: 'white' }}
            >
              {selectedUserRow.firstName} {selectedUserRow.lastName} |{' '}
              {selectedUserRow.position}
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
          >
            {/* Make this with the correct links/information */}
            <MailOutline /> Email
            <NoteAltOutlined /> Overview
            <DescriptionOutlined /> Application
          </Typography>
        </Stack>
        <Button variant="text" size="small" onClick={handleClose}>
          <Close />
        </Button>
      </Stack>
      <Stack direction="column">
        <Stack direction="row">
          <Typography variant="body1">Application Stage: </Typography>
          <Select size="small" value={selectedApplication.stage}>
            <MenuItem value={selectedApplication.stage}>
              {selectedApplication.stage}
            </MenuItem>
          </Select>
        </Stack>
        <Stack direction="row">
          <Typography variant="body1">Assigned To: </Typography>
          {/* TODO: Give this button assigned to functionality (account for authorization somehow) */}
          <Select
            size="small"
            value={selectedApplication.assignedRecruiters.map(
              (recruiter) => recruiter.firstName + ' ' + recruiter.lastName,
            )}
          >
            {selectedApplication.assignedRecruiters.map((recruiter) => (
              <MenuItem
                key={recruiter.id}
                value={recruiter.firstName + ' ' + recruiter.lastName}
              >
                {recruiter.firstName} {recruiter.lastName}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack direction="row">
          <Typography variant="body1">Review Step: </Typography>
          <Select size="small" value={selectedApplication.step}>
            <MenuItem value={selectedApplication.step}>
              {selectedApplication.step}
            </MenuItem>
          </Select>
        </Stack>
      </Stack>
      <Stack direction="row">
        <Stack
          direction="column"
          sx={{ flex: 3, border: '1px solid #6225b0', borderRadius: 1, p: 2 }}
        >
          <Typography variant="h5">Application Response</Typography>
          <List>
            {selectedApplication.response.map((response, index) => (
              <ListItem key={index}>
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
                </Stack>
              </ListItem>
            ))}
          </List>
        </Stack>
        <Stack direction="column" sx={{ flex: 1 }}>
          <Stack
            direction="column"
            sx={{ border: '1px solid #6225b0', borderRadius: 1, p: 2 }}
          >
            <Typography variant="h5">Recruiter Review</Typography>
            <Box
              component="form"
              onSubmit={handleFormSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl size="small">
                <FormLabel sx={{ color: '#ccc' }}>Rating</FormLabel>
                {reviewRating.map((rating, index) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    mb={2}
                    key={index}
                  >
                    <Typography variant="body1">Rating {index + 1}:</Typography>
                    <Rating
                      name={`review-rating-${index}`}
                      value={rating}
                      onChange={(_, value) => handleRatingChange(index, value)}
                      precision={1}
                    />
                  </Stack>
                ))}
              </FormControl>

              <FormControl size="small">
                <FormLabel sx={{ color: '#ccc' }}>
                  Final Recommendation
                </FormLabel>
                <Select
                  value={decision || ''}
                  onChange={(e) =>
                    handleDecisionChange(e.target.value as Decision)
                  }
                >
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
                    color: '#ccc',
                  }}
                />
              </FormControl>

              <Button variant="contained" size="small" type="submit">
                Submit
              </Button>
            </Box>
            <Divider sx={{ my: 2, borderColor: '#ccc' }} />
            <Stack>
              <Typography variant="h6">Reviews</Typography>
              {selectedApplication.reviews.map((review, index) => {
                return (
                  <Stack key={index} direction="column">
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1">Name:</Typography>
                      <Typography variant="body1">Time/Date</Typography>
                    </Stack>
                    <Stack
                      direction="column"
                      sx={{ backgroundColor: '#2a2a2a', borderRadius: 1, p: 1 }}
                    >
                      <Typography variant="body1">
                        {review.rating}/{review.stage}
                      </Typography>
                      <Typography variant="body1">
                        Comment: {review.content}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default IndividualApplicationDetails;
