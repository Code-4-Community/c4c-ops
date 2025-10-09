import { Stack, Typography, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import apiClient from '@api/apiClient';
import {
  Application,
  ApplicationRow,
  Decision,
} from '@sharedTypes/types/application.types';
import { BaseModal } from '@shared/components/BaseModal';

interface DecisionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUserRow: ApplicationRow | null;
  selectedApplication: Application;
  accessToken: string;
}

/**
 * Modal for submitting accept/reject decisions on applications.
 * Uses BaseModal for consistent UI and behavior.
 */
export const DecisionModal = ({
  open,
  setOpen,
  selectedUserRow,
  selectedApplication,
  accessToken,
}: DecisionModalProps) => {
  const [decision, setDecision] = useState<Decision | ''>('');

  const handleClose = () => {
    setOpen(false);
    setDecision(''); // Reset form
  };

  const handleSubmit = async () => {
    if (!selectedUserRow?.userId || !decision) {
      alert('Please select a user and provide a decision on their application');
      return;
    }

    try {
      await apiClient.submitDecision(
        accessToken,
        selectedUserRow.userId,
        decision,
      );
      alert('Decision submitted successfully!');
      handleClose();
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision.');
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Submit Decision"
      onSubmit={handleSubmit}
      submitLabel="Submit Decision"
      submitDisabled={!decision}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="body1">Decision:</Typography>
        <Select
          name="decision"
          value={decision || ''}
          onChange={(e) => setDecision(e.target.value as Decision)}
          fullWidth
        >
          <MenuItem value={Decision.ACCEPT}>Accept</MenuItem>
          <MenuItem value={Decision.REJECT}>Reject</MenuItem>
        </Select>
      </Stack>
    </BaseModal>
  );
};
