import { useEffect, useState, useRef } from 'react';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import { Cycle } from '@backend/applications/dto/cycle';
import { getCurrentCycle } from '@backend/applications/utils';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from '@mui/material';
import { DoneOutline } from '@mui/icons-material';

import { ApplicationRow, Application, Semester } from '../types';
import { User } from '@backend/users/user.entity';
import apiClient from '@api/apiClient';
import { applicationColumns } from './columns';
import { ReviewModal } from './reviewModal';
import useLoginContext from '@components/LoginPage/useLoginContext';

const TODAY = new Date();

const getCurrentSemester = (): Semester => {
  const month: number = TODAY.getMonth();
  if (month >= 1 && month <= 7) {
    return Semester.FALL; // We will be recruiting for the fall semester during Feb - Aug
  }
  return Semester.SPRING; // We will be recruiting for the spring semester during Sep - Jan
};

const getCurrentYear = (): number => {
  return TODAY.getFullYear();
};

export function ApplicationTable() {
  const isPageRendered = useRef<boolean>(false);

  const { token: accessToken } = useLoginContext();
  // TODO implement auto token refresh
  const [data, setData] = useState<ApplicationRow[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
  const [selectedUserRow, setSelectedUserRow] = useState<ApplicationRow | null>(
    null,
  );
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [previousApps, setPreviousApps] = useState<{ position: string; semester: string; year: number}[]>([]);
const [open, setOpen] = useState(false);

const handleOpenAppModal = async () => {
  if (!selectedUser) return;

  try {
    const response = await fetch(`/api/apps/user/${selectedUser.id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const applications = await response.json();

    if (!Array.isArray(applications)) {
      throw new Error("Applications data is not an array");
    }

    // Get the current cycle
    const currentCycle = getCurrentCycle();

    // Filter out applications from the current cycle
    const previousApps = applications.filter((app) => {
      const appCycle = new Cycle(app.year, app.semester);
      return !appCycle.isCurrentCycle(currentCycle);
    });

    setPreviousApps(previousApps);
    setOpen(true);
  } catch (error) {
    console.error("Error fetching applications:", error);
  }
};


  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const fetchData = async () => {
    const data = await apiClient.getAllApplications(accessToken);
    // Each application needs an id for the DataGrid to work
    if (data) {
      data.forEach((row, index) => {
        row.id = index;
      });
      setData(data);
    }
  };

  const getApplication = async (userId: number) => {
    try {
      const application = await apiClient.getApplication(accessToken, userId);
      setSelectedApplication(application);

      if (application.user) {
        setSelectedUser(application.user);
      } else {
        console.warn("User not found in application response");
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to fetch application details.');
    }
  };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  useEffect(() => {
    if (isPageRendered.current) {
      fetchData();
      getFullName();
    }
    isPageRendered.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (rowSelection.length > 0) {
      setSelectedUserRow(data[rowSelection[0] as number]);
    }
  }, [rowSelection, data]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" mb={1}>
        Welcome back, {fullName ? fullName : 'User'}
      </Typography>
      <Typography variant="h6" mb={1}>
        Current Recruitment Cycle: {getCurrentSemester()} {getCurrentYear()}
      </Typography>
      <Typography variant="body1" mb={3}>
        Assigned For Review: Jane Smith, John Doe (Complete by 5/1/2024)
      </Typography>
      <DataGrid
        rows={data}
        columns={applicationColumns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelection(newRowSelectionModel);
          const selectedRow = data[newRowSelectionModel[0] as number];
          getApplication(selectedRow.userId);
        }}
        rowSelectionModel={rowSelection}
      />

      <Typography variant="h6" mt={3}>
        {selectedUserRow
          ? `Selected Applicant: ${selectedUserRow.firstName} ${selectedUserRow.lastName}`
          : 'No Applicant Selected'}
      </Typography>

      {/* TODO refactor application details into a separate component */}
      {selectedApplication ? (
        <>
          <Typography variant="h6" mt={2}>
            Application Details
          </Typography>
          <Stack spacing={2} direction="row" mt={1}>
            <Typography variant="body1">
              Year: {selectedApplication.year}
            </Typography>
            <Typography variant="body1">
              Semester: {selectedApplication.semester}
            </Typography>
            <Typography variant="body1">
              Position: {selectedApplication.position}
            </Typography>
            <Typography variant="body1">
              Stage: {selectedApplication.stage}
            </Typography>
            <Typography variant="body1">
              Status: {selectedApplication.step}
            </Typography>
            <Typography variant="body1">
              Total Applications Submitted: {selectedUser ? selectedUser.numApps : ''}
            </Typography>
            <Button variant="contained" size="small" onClick={handleOpenAppModal}>
            Previous Applications
          </Button>

          <Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Previous Applications</DialogTitle>
  <DialogContent>
    {previousApps.length > 0 ? (
      <List>
        {previousApps.map((app, index) => (
          <ListItem key={index}>
            <ListItemText primary={`Position: ${app.position}`} secondary={`Semester: ${app.semester} ${app.year}`} />
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography>No previous applications found.</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

          </Stack>
          <Typography variant="body1" mt={1}>
            Application Responses
          </Typography>
          <List disablePadding dense>
            {selectedApplication.response.map((response, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <DoneOutline />
                </ListItemIcon>
                <ListItemText
                  primary={`Question: ${response.question}`}
                  secondary={`Answer: ${response.answer}`}
                />
              </ListItem>
            ))}
          </List>

          {/* TODO refactor reviews into a separate component */}
          <Stack>
            <Stack>
              Reviews:
              {selectedApplication.reviews.map((review, index) => {
                return (
                  <Stack key={index} direction="row" spacing={1}>
                    <Typography variant="body1">
                      stage: {review.stage}
                    </Typography>
                    <Typography variant="body1">
                      rating: {review.rating}
                    </Typography>
                    <Typography variant="body1">
                      comment: {review.content}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenReviewModal}
            >
              Start Review
            </Button>
          </Stack>
          <ReviewModal
            open={openReviewModal}
            setOpen={setOpenReviewModal}
            selectedUserRow={selectedUserRow}
            selectedApplication={selectedApplication}
            accessToken={accessToken}
          />
        </>
      ) : null}
    </Container>
  );
}
