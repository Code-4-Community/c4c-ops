import { Typography, Box, IconButton } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useState } from 'react';
import { ApplicationRow, Review, User } from '../types';
import { RatingPopup } from './RatingPopup';
import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';

interface RatingCellProps {
  value: number | null;
  row: ApplicationRow;
}

export const RatingCell = ({ value, row }: RatingCellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewers, setReviewers] = useState<Map<number, User>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { token: accessToken } = useLoginContext();

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(true);

    // Fetch reviews data when popup is opened
    if (!isLoading && reviews.length === 0) {
      setIsLoading(true);
      try {
        const application = await apiClient.getApplication(
          accessToken,
          row.userId,
        );
        setReviews(application.reviews);

        // Fetch reviewer information for each review
        const reviewersMap = new Map<number, User>();
        const uniqueReviewerIds = [
          ...new Set(application.reviews.map((review) => review.reviewerId)),
        ];

        for (const reviewerId of uniqueReviewerIds) {
          try {
            const reviewer = await apiClient.getUserById(
              accessToken,
              reviewerId,
            );
            reviewersMap.set(reviewerId, reviewer);
          } catch (error) {
            console.error(`Error fetching reviewer ${reviewerId}:`, error);
            // Create a fallback user object if we can't fetch the reviewer
            reviewersMap.set(reviewerId, {
              id: reviewerId,
              firstName: 'Unknown',
              lastName: 'Reviewer',
              email: '',
              status: '',
              profilePicture: null,
              linkedin: null,
              github: null,
              team: null,
              role: null,
            });
          }
        }
        setReviewers(reviewersMap);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setReviewers(new Map());
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography>
          {/* TODO: add a placeholder for the rating, rn its _._ because its off-center as [v] */}
          {`${value ? value.toFixed(1) : '_._'} / 5`}
        </Typography>
        {isOpen ? (
          <IconButton
            onClick={handleClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
            }}
          >
            <KeyboardArrowUp
              sx={{
                fontSize: '1rem',
                color: 'text.secondary',
                opacity: 0.7,
              }}
            />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
            }}
          >
            <KeyboardArrowDown
              sx={{
                fontSize: '1rem',
                color: 'text.secondary',
                opacity: 0.7,
              }}
            />
          </IconButton>
        )}
      </Box>
      {/* Self-contained popup */}
      {isOpen && (
        <RatingPopup
          anchorEl={anchorEl}
          onClose={handleClose}
          reviews={reviews}
          reviewers={reviewers}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
