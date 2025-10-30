import { Stack, Typography, Rating, TextField, Box } from '@mui/material';
import { useState } from 'react';
import apiClient from '@api/apiClient';
import {
  Application,
  ApplicationRow,
  ApplicationStage,
} from '@sharedTypes/types/application.types';
import { NUM_REVIEW_RATINGS } from '@constants/recruitment';
import { BaseModal } from '@shared/components/BaseModal';

interface ReviewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUserRow: ApplicationRow | null;
  selectedApplication: Application;
  accessToken: string;
}

/**
 * Modal for submitting reviews on applications.
 * Collects multiple ratings and a text comment.
 * Uses BaseModal for consistent UI and behavior.
 */
export const ReviewModal = ({
  open,
  setOpen,
  selectedUserRow,
  selectedApplication,
  accessToken,
}: ReviewModalProps) => {
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState<number[]>(
    Array(NUM_REVIEW_RATINGS).fill(0),
  );

  const handleRatingChange = (index: number, value: number | null) => {
    const newRatings = [...reviewRating];
    newRatings[index] = value || 0;
    setReviewRating(newRatings);
  };

  const handleClose = () => {
    setOpen(false);
    setReviewComment('');
    setReviewRating(Array(NUM_REVIEW_RATINGS).fill(0));
  };

  const stageToSubmit = selectedApplication?.stage || ApplicationStage.ACCEPTED;

  const handleSubmit = async () => {
    // Validation
    if (
      !selectedUserRow ||
      reviewRating.some((rating) => rating === 0) ||
      !reviewComment
    ) {
      alert('Please select a user, provide a rating, and add a comment.');
      return;
    }

    const totalRatings = reviewRating.reduce((sum, rating) => sum + rating, 0);
    const averageRating = Number(
      (totalRatings / reviewRating.length).toFixed(1),
    );

    const concatenatedComments = reviewRating
      .map((rating, index) => `Review ${index + 1}: ${rating}`)
      .join(', ');

    try {
      await apiClient.submitReview(accessToken, {
        applicantId: selectedUserRow.userId,
        stage: stageToSubmit,
        rating: averageRating,
        content: `${reviewComment} | ${concatenatedComments}`,
      });

      alert('Reviews submitted successfully!');
      handleClose();
    } catch (error) {
      console.error('Error submitting reviews:', error);
      alert('Failed to submit reviews.');
    }
  };

  const isFormValid =
    selectedUserRow &&
    reviewRating.every((rating) => rating > 0) &&
    reviewComment.trim().length > 0;

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Write Review"
      onSubmit={handleSubmit}
      submitLabel="Submit Review"
      submitDisabled={!isFormValid}
      maxWidth="md"
    >
      <Box sx={{ mt: 2 }}>
        {reviewRating.map((rating, index) => (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            mb={2}
            key={index}
          >
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              Rating {index + 1}:
            </Typography>
            <Rating
              name={`review-rating-${index}`}
              value={rating}
              onChange={(_, value) => handleRatingChange(index, value)}
              precision={1}
            />
          </Stack>
        ))}
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
          sx={{ mt: 2 }}
        />
      </Box>
    </BaseModal>
  );
};
