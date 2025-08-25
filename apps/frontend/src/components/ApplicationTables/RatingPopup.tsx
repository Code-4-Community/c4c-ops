import {
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Review, User } from '../types';

interface RatingPopupProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  reviews: Review[];
  reviewers: Map<number, User>;
  isLoading?: boolean;
}

export const RatingPopup = ({
  anchorEl,
  onClose,
  reviews,
  reviewers,
  isLoading = false,
}: RatingPopupProps) => {
  const open = Boolean(anchorEl);

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getReviewerName = (reviewerId: number): string => {
    const reviewer = reviewers.get(reviewerId);
    if (reviewer) {
      return `${reviewer.firstName} ${reviewer.lastName}`;
    }
    return `Unknown reviewer of id: ${reviewerId}`;
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        '& .MuiPopover-paper': {
          maxWidth: 400,
          maxHeight: 500,
          overflow: 'auto',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reviews yet
          </Typography>
        ) : (
          <List dense sx={{ p: 0 }}>
            {reviews.map((review, index) => (
              <ListItem
                key={review.id}
                sx={{
                  px: 0,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    mb: 1,
                  }}
                >
                  <Chip
                    label={getReviewerName(review.reviewerId)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'medium', mr: 1 }}
                  >
                    Rating:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatRating(review.rating)} / 5
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                >
                  "{review.content}"
                </Typography>
                {index < reviews.length - 1 && (
                  <Divider sx={{ my: 2, width: '100%' }} />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
};
