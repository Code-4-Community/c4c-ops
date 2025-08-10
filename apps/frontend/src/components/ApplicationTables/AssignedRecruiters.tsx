import { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
} from '@mui/material';
import { AssignedRecruiter } from '../types';
import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';

interface AssignedRecruitersProps {
  applicationId: number;
  assignedRecruiters: AssignedRecruiter[];
  onRecruitersChange?: (recruiterIds: number[]) => void;
  onRefreshData?: () => void;
}

export function AssignedRecruiters({
  applicationId,
  assignedRecruiters,
  onRecruitersChange,
  onRefreshData,
}: AssignedRecruitersProps) {
  const { token: accessToken } = useLoginContext();
  const [allRecruiters, setAllRecruiters] = useState<AssignedRecruiter[]>([]);
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<number[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  // Fetch all available recruiters
  const fetchAllRecruiters = async () => {
    try {
      setLoading(true);
      const recruiters = await apiClient.getAllRecruiters(accessToken);
      setAllRecruiters(recruiters);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize selected recruiters from props
  useEffect(() => {
    const assignedIds = assignedRecruiters.map((recruiter) => recruiter.id);
    setSelectedRecruiterIds(assignedIds);
  }, [assignedRecruiters]);

  // Fetch all available recruiters
  useEffect(() => {
    fetchAllRecruiters();
  }, [accessToken]);

  const handleRecruiterChange = async (event: any) => {
    const newSelectedIds = event.target.value as number[];
    setSelectedRecruiterIds(newSelectedIds);

    try {
      // Call the API to update assigned recruiters
      await apiClient.assignRecruiters(
        accessToken,
        applicationId,
        newSelectedIds,
      );

      // Notify parent component of the change
      if (onRecruitersChange) {
        onRecruitersChange(newSelectedIds);
      }

      // Refresh the data after successful assignment
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error assigning recruiters:', error);
      // Revert the selection on error
      setSelectedRecruiterIds(
        assignedRecruiters.map((recruiter) => recruiter.id),
      );
    }
  };

  const renderValue = (selected: number[]) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map((recruiterId) => {
        const recruiter = allRecruiters.find((r) => r.id === recruiterId);
        return (
          <Chip
            key={recruiterId}
            label={
              recruiter
                ? `${recruiter.firstName} ${recruiter.lastName}`
                : `Recruiter ${recruiterId}`
            }
            size="small"
          />
        );
      })}
    </Box>
  );

  return (
    <FormControl fullWidth sx={{ minWidth: 300 }}>
      <InputLabel>Assigned Recruiters</InputLabel>
      <Select
        multiple
        value={selectedRecruiterIds}
        onChange={handleRecruiterChange}
        renderValue={renderValue}
        label="Assigned Recruiters"
        disabled={loading}
      >
        {allRecruiters.map((recruiter) => (
          <MenuItem key={recruiter.id} value={recruiter.id}>
            {recruiter.firstName} {recruiter.lastName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
