import { useEffect, useState, useRef } from 'react';
import {
  DataGrid,
  GridRowSelectionModel,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { Snackbar, Alert } from '@mui/material';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { DoneOutline } from '@mui/icons-material';

import {
  ApplicationRow,
  Application,
  Semester,
  ApplicationStage,
} from '../types';
import apiClient from '@api/apiClient';
import { applicationColumns } from './columns';
import { ReviewModal } from './reviewModal';
import useLoginContext from '@components/LoginPage/useLoginContext';

const TODAY = new Date();

const STAGE_OPTIONS: ApplicationStage[] = [
  ApplicationStage.RESUME,
  ApplicationStage.INTERVIEW,
  ApplicationStage.ACCEPTED,
  ApplicationStage.REJECTED,
  ApplicationStage.TECHNICAL_CHALLENGE,
  ApplicationStage.PM_CHALLENGE,
];

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

  const [openReviewModal, setOpenReviewModal] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleToastClose = () => {
    setToastOpen(false);
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
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to fetch application details.');
    }
  };

  const updateStage = async (userId: number, newStage: ApplicationStage) => {
    try {
      // send payload to backend & update local state
      await apiClient.updateStage(accessToken, userId, newStage);
      setData((prevData) =>
        prevData.map((row) =>
          row.userId === userId ? { ...row, stage: newStage } : row,
        ),
      );

      // if this row is selected update the selected application too
      if (selectedUserRow?.userId === userId) {
        setSelectedApplication((prev) =>
          prev ? { ...prev, stage: newStage } : null,
        );
      }
      setToastMessage(`Stage updated to ${newStage} successfully!`);
      setToastOpen(true);
    } catch (error) {
      setToastMessage('Failed to update stage. Please try again.');
      setToastOpen(true);
    }
  };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  const enhancedColumns: GridColDef[] = applicationColumns.map((col) => {
    if (col.field === 'stage') {
      return {
        ...col,
        width: 240,
        renderCell: (params: GridRenderCellParams<ApplicationRow>) => {
          const handleStageChange = async (event: SelectChangeEvent) => {
            const newStage = event.target.value as ApplicationStage;
            await updateStage(params.row.userId, newStage);
          };

          return (
            <FormControl size="medium" fullWidth>
              <Select
                value={params.value || ''}
                onChange={handleStageChange}
                placeholder={'Select'}
                variant={'standard'}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiInput-underline:before': {
                    display: 'none',
                  },
                  '& .MuiInput-underline:after': {
                    display: 'none',
                  },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    display: 'none',
                  },
                }}
              >
                {STAGE_OPTIONS.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        },
      };
    } else if (col.field === 'assigned') {
      return {
        ...col,
        renderCell: (params: GridRenderCellParams<ApplicationRow>) => {
          return (
            <FormControl size="medium" fullWidth>
              <Select
                value={params.value || 'Unassigned'}
                placeholder={'Unassigned'}
                variant={'standard'}
                displayEmpty
                sx={{
                  fontSize: '0.875rem',
                }}
              >
                {/* TODO: backend integration */}
                <MenuItem value="Unassigned" sx={{ fontSize: '0.875rem' }}>
                  Unassigned
                </MenuItem>
                <MenuItem value="Jane Smith" sx={{ fontSize: '0.875rem' }}>
                  Jane Smith
                </MenuItem>
              </Select>
            </FormControl>
          );
        },
      };
    }
    return col;
  });

  useEffect(() => {
    fetchData();
    getFullName();
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
        columns={enhancedColumns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelection(newRowSelectionModel);
          getApplication(data[newRowSelectionModel[0] as number].userId);
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
              Applications: {selectedApplication.numApps}
            </Typography>
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

            {selectedUserRow && (
              <Button
              // onClick={(event) => changeStage(event, selectedUserRow.userId)}
              >
                Move Stage
              </Button>
            )}
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
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastMessage.includes('Failed') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
