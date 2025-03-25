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

interface ReviewData {
  numReviews: number;
}

const reviewData: ReviewData = {
  numReviews: 5,
};

export const ReviewModal = ({
  open,
  setOpen,
  selectedUserRow,
  selectedApplication,
  accessToken,
}: ReviewModalProps) => {
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState<number[]>(
    Array(reviewData.numReviews).fill(0),
  );

  const handleRatingChange = (index: number, value: number | null) => {
    const newRatings = [...reviewRating];
    newRatings[index] = value || 0; // Update the rating for the specified index
    setReviewRating(newRatings);
  };

  const handleCloseReviewModal = () => {
    setOpen(false);
    setReviewComment('');
  };
  const stageToSubmit = selectedApplication?.stage || ApplicationStage.ACCEPTED;

  const handleReviewSubmit = async () => {
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
      !reviewComment
    ) {
      alert('Please select a user, provide a rating, and add a comment.');
      return;
    }

    try {
      await apiClient.submitReview(accessToken, {
        applicantId: selectedUserRow.userId,
        stage: stageToSubmit,
        rating: Number(averageRating.toFixed(1)),
        content: `${reviewComment} | ${concatenatedComments}`,
      });

      alert('Reviews submitted successfully!');
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting reviews:', error);
      alert('Failed to submit reviews.');
    }
  };
  return (
    <Dialog open={open} onClose={handleCloseReviewModal}>
      <DialogTitle>Write Review</DialogTitle>
      <DialogContent>
        <div>
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
        </div>
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
          value={reviewComment} // add comments here
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
