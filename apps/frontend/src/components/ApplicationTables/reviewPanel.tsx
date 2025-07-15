import { useState } from 'react';
import {
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import apiClient from '@api/apiClient';
import {
  Application,
  ApplicationRow,
  ApplicationStage,
  Review,
} from '../types';

interface ReviewPanelProps {
  selectedUserRow: ApplicationRow | null;
  selectedApplication: Application;
  accessToken: string;
  currentUserFullName: string;
  currentUserStatus: string;
}

const ratingOptions = [
  { value: 1, label: '1 star - Not recommended' },
  { value: 2, label: '2 stars - Weak applicant' },
  { value: 3, label: '3 stars - Average applicant' },
  { value: 4, label: '4 stars - Solid applicant' },
  { value: 5, label: '5 stars - Strongly recommended' },
];

const recommendationOptions = [
  'Reject',
  'Neutral',
  'Accept to Interview Stage',
];

export function ReviewPanel({
  selectedUserRow,
  selectedApplication,
  accessToken,
  currentUserFullName,
  currentUserStatus,
}: ReviewPanelProps) {
  const [rating, setRating] = useState<number | ''>('');
  const [recommendation, setRecommendation] = useState('');
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(selectedApplication.reviews || []);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState<number | ''>('');
  const [editRecommendation, setEditRecommendation] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!rating || !recommendation || !comment) {
      alert('Please fill out all fields.');
      return;
    }

    const stageToSubmit =
      selectedApplication?.stage || ApplicationStage.ACCEPTED;

    try {
      if (!selectedUserRow) {
        alert('No applicant selected');
        return;
      }

      const reviewPayload = {
        applicantId: selectedUserRow.userId,
        stage: stageToSubmit,
        rating,
        content: `Recommendation: ${recommendation}\nComment: ${comment}`,
      };

      const createdReview = (await apiClient.submitReview(
        accessToken,
        reviewPayload,
      )) as Review;

      alert('Review created Successfully!');

      const newReview: Review = {
        ...createdReview,
        reviewerName: currentUserFullName,
      };

      setReviews([newReview, ...reviews]);
      setRating('');
      setRecommendation('');
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    }
  };

  const handleEditSubmit = async () => {
    if (
      !editRating ||
      !editRecommendation ||
      !editComment ||
      editingReviewId === null
    ) {
      alert('Fill all fields');
      return;
    }

    const updatedPayload = {
      rating: editRating,
      content: `Recommendation: ${editRecommendation}\nComment: ${editComment}`,
      stage: selectedApplication.stage,
    };

    try {
      await apiClient.updateReview(
        accessToken,
        editingReviewId,
        updatedPayload,
      );

      setReviews(
        reviews.map((r) =>
          r.id === editingReviewId
            ? {
                ...r,
                rating: editRating,
                content: updatedPayload.content,
                updatedAt: new Date(),
              }
            : r,
        ),
      );

      setEditingReviewId(null);
      setEditRating('');
      setEditRecommendation('');
      setEditComment('');
      alert('Review updated!');
    } catch (err) {
      console.error('Failed to update review', err);
      alert('Error updating review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await apiClient.deleteReview(accessToken, reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      alert('Review deleted');
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete review');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recruiter Review
      </Typography>

      <FormControl fullWidth margin="dense">
        <InputLabel>Rating</InputLabel>
        <Select
          value={rating}
          label="Rating"
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {ratingOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="dense">
        <InputLabel>Final Recommendation</InputLabel>
        <Select
          value={recommendation}
          label="Final Recommendation"
          onChange={(e) => setRecommendation(e.target.value)}
        >
          {recommendationOptions.map((opt, index) => (
            <MenuItem key={index} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Comment"
        multiline
        rows={4}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        margin="dense"
      />

      <Stack direction="row" justifyContent="flex-end" mt={2}>
        <Button variant="contained" onClick={handleSubmit}>
          Submit Review
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Submitted Reviews
      </Typography>

      <Stack spacing={2}>
        {reviews.map((review, index) => (
          <Box key={index} border={1} borderRadius={2} p={2}>
            <Typography variant="subtitle2">
              Reviewer: {review.reviewerName}
            </Typography>
            <Typography variant="caption">
              {new Date(review.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" mt={1}>
              Rating: {review.rating}
            </Typography>
            <Typography variant="body2">{review.content}</Typography>
            {review.reviewerName === currentUserFullName && (
              <Button
                size="small"
                onClick={() => {
                  setEditingReviewId(review.id);
                  const [recLine, ...commentLines] = review.content.split('\n');
                  setEditRecommendation(
                    recLine.replace('Recommendation: ', ''),
                  );
                  setEditComment(
                    commentLines.join('\n').replace('Comment: ', ''),
                  );
                  setEditRating(review.rating);
                }}
              >
                Edit
              </Button>
            )}
            {currentUserStatus === 'Admin' && (
              <Button
                size="small"
                color="error"
                onClick={() => setConfirmDeleteId(review.id)}
              >
                Delete
              </Button>
            )}
          </Box>
        ))}
      </Stack>

      {editingReviewId && (
        <Box mt={4}>
          <Typography variant="h6">Edit Your Review</Typography>

          <FormControl fullWidth margin="dense">
            <InputLabel>Rating</InputLabel>
            <Select
              value={editRating}
              label="Rating"
              onChange={(e) => setEditRating(Number(e.target.value))}
            >
              {ratingOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Final Recommendation</InputLabel>
            <Select
              value={editRecommendation}
              label="Final Recommendation"
              onChange={(e) => setEditRecommendation(e.target.value)}
            >
              {recommendationOptions.map((opt, index) => (
                <MenuItem key={index} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Updated Comment"
            multiline
            rows={4}
            fullWidth
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            margin="dense"
          />

          <Stack direction="row" spacing={1} mt={2}>
            <Button variant="contained" onClick={handleEditSubmit}>
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingReviewId(null);
                setEditRating('');
                setEditRecommendation('');
                setEditComment('');
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      )}
      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (confirmDeleteId !== null) {
                handleDeleteReview(confirmDeleteId);
                setConfirmDeleteId(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
