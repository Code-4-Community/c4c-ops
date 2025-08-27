import { useEffect, useState, useRef } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
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
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { DoneOutline } from '@mui/icons-material';

import {
  ApplicationRow,
  Application,
  Semester,
  Review,
  ReviewStatus,
  ApplicationStage,
} from '../types';
import apiClient from '@api/apiClient';
import { applicationColumns } from './columns';
import { ReviewModal } from './reviewModal';
import { AssignedRecruiters } from './AssignedRecruiters';
import useLoginContext from '@components/LoginPage/useLoginContext';

const TODAY = new Date();
const REVIEW_OPTIONS: ReviewStatus[] = Object.values(ReviewStatus);

const STAGE_OPTIONS: ApplicationStage[] = Object.values(
  ApplicationStage,
).filter((value): value is ApplicationStage => typeof value === 'string');

const STAGE_KEYS = Object.keys(ApplicationStage).filter((key) =>
  isNaN(Number(key)),
) as (keyof typeof ApplicationStage)[];

const getCurrentSemester = (): Semester => {
  const month: number = TODAY.getMonth();
  if (month >= 1 && month <= 7) {
    return Semester.FALL;
  }
  return Semester.SPRING;
};

const getCurrentYear = (): number => {
  return TODAY.getFullYear();
};

const formatStageName = (stage: string): string => {
  return stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
};

const mapStageStringToEnumKey = (stageString: string): string => {
  const stageMap: { [key: string]: string } = {
    'Application Received': 'APP_RECEIVED',
    'PM Challenge': 'PM_CHALLENGE',
    'Behavioral Interview': 'B_INTERVIEW',
    'Technical Interview': 'T_INTERVIEW',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
  };

  return stageMap[stageString] || stageString;
};

const mapEnumKeyToStageValue = (enumKey: string): string => {
  const keyToValueMap: { [key: string]: string } = {
    APP_RECEIVED: 'Application Received',
    PM_CHALLENGE: 'PM Challenge',
    B_INTERVIEW: 'Behavioral Interview',
    T_INTERVIEW: 'Technical Interview',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
  };

  return keyToValueMap[enumKey] || 'Application Received';
};

export function ApplicationTable() {
  const isPageRendered = useRef<boolean>(false);

  const { token: accessToken } = useLoginContext();
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
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const fetchData = async () => {
    try {
      const data = await apiClient.getAllApplications(accessToken);
      if (data) {
        data.forEach((row, index) => {
          row.id = index;
        });
        setData(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setToastMessage('Failed to fetch applications. Please try again.');
      setToastOpen(true);
    }
  };

  const getApplication = async (userId: number) => {
    try {
      const application = await apiClient.getApplication(accessToken, userId);
      setSelectedApplication(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      setToastMessage('Failed to fetch application details.');
      setToastOpen(true);
    }
  };

  const updateStage = async (userId: number, newStage: string) => {
    if (isUpdatingStage) return;

    console.log('Updating stage for userId:', userId);
    console.log('New stage value being sent to backend:', newStage);
    console.log('Type of new stage:', typeof newStage);
    setIsUpdatingStage(true);

    try {
      // @ts-expect-error todo
      const result = await apiClient.updateStage(accessToken, userId, newStage);
      console.log('API response:', result);

      // @ts-expect-error todo
      setData((prevData) =>
        prevData.map((row) =>
          row.userId === userId ? { ...row, stage: newStage } : row,
        ),
      );

      if (selectedUserRow?.userId === userId) {
        // @ts-expect-error todo
        setSelectedApplication((prev) =>
          prev ? { ...prev, stage: newStage } : null,
        );
      }

      setToastMessage(`Stage updated to ${newStage} successfully!`);
      setToastOpen(true);
    } catch (error) {
      console.error('Error updating stage:', error);
      setToastMessage('Failed to update stage. Please try again.');
      setToastOpen(true);

      await fetchData();
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const updateReviewStage = async (
    userId: number,
    newReviewStage: ReviewStatus,
  ) => {
    try {
      // payload goes to apiClient and updates local state
      await apiClient.updateReviewStage(accessToken, userId, newReviewStage);
      setData((prevData) =>
        prevData.map((row) =>
          row.userId === userId ? { ...row, review: newReviewStage } : row,
        ),
      );
      if (selectedUserRow?.userId === userId) {
        setSelectedApplication((prev) =>
          prev ? { ...prev, review: newReviewStage } : null,
        );
      }
      setToastMessage(
        `Review stage updated to ${newReviewStage} successfully!`,
      );
      setToastOpen(true);
    } catch (error) {
      setToastMessage('Failed to update Review stage. Please try again.');
      setToastOpen(true);
    }
  };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  const enhancedColumns: GridColDef[] = applicationColumns.map((col) => {
    if (col.field === 'review') {
      return {
        ...col,
        width: 240,
        renderCell: (params: GridRenderCellParams<ApplicationRow>) => {
          const handleReviewStageChange = async (event: SelectChangeEvent) => {
            const newReviewStage = event.target.value as ReviewStatus;
            await updateReviewStage(params.row.userId, newReviewStage);
          };
          return (
            <FormControl size="medium" fullWidth>
              <Select
                value={params.value || ''}
                onChange={handleReviewStageChange}
                placeholder={'Select'}
                variant={'standard'}
                sx={{ fontSize: '0.875rem', color: 'white' }}
              >
                {REVIEW_OPTIONS.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{ fontSize: '0.875rem', color: 'white' }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        },
      };
    } else if (col.field === 'stage') {
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
                sx={{ fontSize: '0.875rem', color: 'white' }}
              >
                {STAGE_OPTIONS.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{ fontSize: '0.875rem', color: 'white' }}
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
              ></Select>
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
      const selectedRow = data[rowSelection[0] as number];
      setSelectedUserRow(selectedRow);
      if (selectedRow) {
        getApplication(selectedRow.userId);
      }
    } else {
      setSelectedUserRow(null);
      setSelectedApplication(null);
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
        columns={enhancedColumns as GridColDef[]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelection(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelection}
      />
      <Typography variant="h6" mt={3}>
        {selectedUserRow
          ? `Selected Applicant: ${selectedUserRow.name}`
          : 'No Applicant Selected'}
      </Typography>

      {selectedApplication ? (
        <>
          <Typography variant="h6" mt={2} mb={1}>
            Assigned Recruiters
          </Typography>
          <AssignedRecruiters
            applicationId={selectedApplication.id}
            assignedRecruiters={selectedApplication.assignedRecruiters}
            onRecruitersChange={(recruiterIds) => {
              // TODO: Delete
              console.log('Recruiters changed:', recruiterIds);
            }}
            onRefreshData={() => {
              // Refresh the data grid and application details
              fetchData();
              if (selectedUserRow) {
                getApplication(selectedUserRow.userId);
              }
            }}
          />
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
              App Stage: {selectedApplication.stage}
            </Typography>
            <Typography variant="body1">
              Status: {selectedApplication.step}
            </Typography>
            <Typography variant="body1">
              Review: {selectedApplication.review}
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
