import { Button, Dialog, DialogTitle, DialogActions } from '@mui/material';
import apiClient from '@api/apiClient';
import { Application } from '@components/types';

interface ConfirmModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedApplication: Application;
  setSelectedApplication: (selectedApplication: Application) => void;
  accessToken: string;
}

export const ConfirmModal = ({
  open,
  setOpen,
  selectedApplication,
  setSelectedApplication,
  accessToken,
}: ConfirmModalProps) => {
  const handleCloseConfirmModal = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    try {
      await apiClient.checkApplicantIn(accessToken, selectedApplication.id);
      const newApplication = await apiClient.getApplication(
        accessToken,
        selectedApplication.id,
      );
      setSelectedApplication(newApplication);
    } catch (error) {
      console.error('Error confirming: ', error);
      alert('Failed to check user in');
    }

    handleCloseConfirmModal();
  };

  return (
    <Dialog open={open} onClose={handleCloseConfirmModal}>
      <DialogTitle>Confirm Event Check-in?</DialogTitle>
      <DialogActions>
        <Button onClick={handleCloseConfirmModal}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};
