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
  MenuItem,
  Select,
} from '@mui/material';
import { useState } from 'react';
import apiClient from '@api/apiClient';
import {
  Application,
  ApplicationRow,
  ApplicationStage,
  Decision,
} from '../types';

interface DecisionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUserRow: ApplicationRow | null;
  selectedApplication: Application;
  accessToken: string;
}

export const DecisionModal = ({
  open,
  setOpen,
  selectedUserRow,
  selectedApplication,
  accessToken,
}: DecisionModalProps) => {
  const [decision, setDecision] = useState<Decision | ''>('');

  const handleDecisionChange = (decision: Decision) => {
    setDecision(decision);
  };

  const handleCloseDecisionModal = () => {
    setOpen(false); // Close modal
    setDecision(''); // Reset form
  };

  // Submit logic
  const handleDecisionSubmit = async () => {
    if (!selectedUserRow?.userId || !decision) {
      alert('Please select a user and provide a decision on their application');
      return;
    }

    try {
      await apiClient.submitDecision(accessToken, selectedUserRow.userId, {
        decision: decision,
      });
      alert('Decision submitted successfully!');
      handleCloseDecisionModal();
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision.');
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseDecisionModal}>
      <DialogTitle>Write Review</DialogTitle>
      <DialogContent>
        <div>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Typography variant="body1">Decision:</Typography>
            <Select
              name={`decision`}
              value={decision || ''}
              onChange={(e) => handleDecisionChange(e.target.value as Decision)}
            >
              <MenuItem value={Decision.ACCEPT}>Accept</MenuItem>
              <MenuItem value={Decision.REJECT}>Reject</MenuItem>
            </Select>
          </Stack>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDecisionModal}>Cancel</Button>
        <Button onClick={handleDecisionSubmit}>Submit Decision</Button>
      </DialogActions>
    </Dialog>
  );
};
