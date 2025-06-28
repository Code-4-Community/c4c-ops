import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import apiClient from '@api/apiClient';
import { ApplicationRow, UserStatus } from '../types';

interface ChangeRoleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUserRow: ApplicationRow | null;
  accessToken: string;
  onRoleChanged: (updatedUser: ApplicationRow) => void;
}

export const ChangeRoleModal = ({
  open,
  setOpen,
  selectedUserRow,
  accessToken,
  onRoleChanged,
}: ChangeRoleModalProps) => {
  const [newStatus, setNewStatus] = useState<string>(
    selectedUserRow?.status || '',
  );

  useEffect(() => {
    if (selectedUserRow) {
      setNewStatus(selectedUserRow.status || '');
    } else {
      setNewStatus('');
    }
  }, [selectedUserRow]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeStatus = async () => {
    if (
      !selectedUserRow?.userId ||
      !newStatus ||
      !Object.values(UserStatus).includes(newStatus as UserStatus)
    ) {
      alert('Please select a user and a valid status.');
      return;
    }

    try {
      const updatedUser = await apiClient.updateUserStatus(
        accessToken,
        selectedUserRow.userId,
        newStatus as UserStatus,
      );

      alert(`User status changed to ${newStatus} successfully!`);
      onRoleChanged(updatedUser);
      handleClose();
    } catch (error) {
      console.error('Error changing user status:', error);
      alert('Failed to change user status.');
    }
  };

  if (!selectedUserRow && open) {
    setOpen(false);
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Change User Status/Permissions</DialogTitle> {}
      <DialogContent>
        {selectedUserRow ? (
          <Typography variant="body1" mb={2}>
            Changing status for:{' '}
            <strong>
              {selectedUserRow.firstName} {selectedUserRow.lastName} (Current:{' '}
              {selectedUserRow.status || 'N/A'})
            </strong>{' '}
            {}
          </Typography>
        ) : (
          <Typography variant="body1" mb={2}>
            No user selected.
          </Typography>
        )}

        <FormControl fullWidth margin="dense">
          <InputLabel id="select-new-status-label">New Status</InputLabel> {}
          <Select
            labelId="select-new-status-label"
            id="select-new-status"
            value={newStatus}
            label="New Status"
            onChange={(event) => setNewStatus(event.target.value as string)}
            disabled={!selectedUserRow}
          >
            {Object.values(UserStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleChangeStatus}
          variant="contained"
          color="primary"
          disabled={
            !selectedUserRow ||
            newStatus === (selectedUserRow.status || '') ||
            !newStatus
          }
        >
          Change Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};
