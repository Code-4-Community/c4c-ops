import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Rating,
  TextField,
  Button,
} from '@mui/material';
import { useState } from 'react';
import apiClient from '@api/apiClient';
import { Application, ApplicationRow, ApplicationStage } from '../types';

interface ReviewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUserRow: ApplicationRow | null;
  selectedApplication: Application;
  accessToken: string;
}

export const ReviewModal = ({
  open,
  setOpen,
  selectedUserRow,
  selectedApplication,
  accessToken,
}: ReviewModalProps) => {
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(0);

  const handleCloseReviewModal = () => {
    setOpen(false);
    setReviewComment('');
  };
  const stageToSubmit = selectedApplication?.stage || ApplicationStage.ACCEPTED;

  const handleReviewSubmit = async () => {
    if (!selectedUserRow || reviewRating === 0 || !reviewComment) {
      alert('Please select a user, provide a rating, and add a comment.');
      return;
    }

    try {
      await apiClient.submitReview(accessToken, {
        applicantId: selectedUserRow.userId,
        stage: stageToSubmit,
        rating: reviewRating,
        content: reviewComment,
      });
      alert('Review submitted successfully!');
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    }
  };
  return (
    <Dialog open={open} onClose={handleCloseReviewModal}>
      <DialogTitle>Write Review</DialogTitle>
      <DialogContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography variant="body1">Rating:</Typography>
          <Rating
            name="review-rating"
            value={reviewRating}
            onChange={(_, value) => setReviewRating(value || 0)}
            precision={1}
          />
        </Stack>
        <TextField
          autoFocus
          margin="dense"
          id="review"
          label="Review Comments"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseReviewModal}>Cancel</Button>
        <Button onClick={handleReviewSubmit}>Submit Review</Button>
      </DialogActions>
    </Dialog>
  );
};
