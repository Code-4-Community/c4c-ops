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
import { DecisionModal } from './decisionModal';
import { ReviewModal } from './reviewModal';
import { AssignedRecruiters } from './AssignedRecruiters';
import useLoginContext from '@components/LoginPage/useLoginContext';

const TODAY = new Date();

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
  const [openDecisionModal, setOpenDecisionModal] = useState(false);

  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const handleOpenDecisionModal = () => {
    setOpenDecisionModal(true);
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

  const getFullName = async () => {
    try {
      setFullName(await apiClient.getFullName(accessToken));
    } catch (error) {
      console.error('Error fetching full name:', error);
    }
  };

  const enhancedColumns: GridColDef[] = applicationColumns.map((col) => {
    if (col.field === 'stage') {
      return {
        ...col,
        width: 240,
        renderCell: (params: GridRenderCellParams<ApplicationRow>) => {
          const handleStageChange = async (
            event: SelectChangeEvent<string>,
          ) => {
            const selectedKey = event.target.value as string;
            console.log('Selected stage key from dropdown:', selectedKey);
            console.log('Sending stage key to backend:', selectedKey);
            await updateStage(params.row.userId, selectedKey);
          };

          // @ts-expect-error todo
          const currentStageKey = mapStageStringToEnumKey(params.row.stage);

          console.log('Original stage from backend:', params.row.stage);
          console.log('Mapped stage key for dropdown:', currentStageKey);

          return (
            <FormControl size="medium" fullWidth>
              <Select
                value={currentStageKey}
                onChange={handleStageChange}
                variant={'standard'}
                disabled={isUpdatingStage}
                displayEmpty
                sx={{
                  fontSize: '0.875rem',
                  color: 'white',
                  '& .MuiSelect-select': {
                    color: 'white',
                  },
                  '& .MuiInput-underline:before': {
                    display: 'none',
                  },
                  '& .MuiInput-underline:after': {
                    display: 'none',
                  },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    display: 'none',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                {!STAGE_KEYS.includes(
                  currentStageKey as keyof typeof ApplicationStage,
                ) &&
                  currentStageKey && (
                    <MenuItem
                      key={currentStageKey}
                      value={currentStageKey}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {currentStageKey}
                    </MenuItem>
                  )}
                {STAGE_KEYS.map((stageKey) => (
                  <MenuItem
                    key={stageKey}
                    value={stageKey}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {stageKey}
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
      <Stack direction="row" alignItems="center" spacing={2} mt={4} mb={8}>
        <img
          src="/c4clogo.png"
          alt="C4C Logo"
          style={{ width: 50, height: 40 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Database | {getCurrentSemester()} {getCurrentYear()} Recruitment Cycle
        </Typography>
      </Stack>
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
              Stage: {selectedApplication.stage}
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

            {selectedUserRow && (
              <Button size="small" onClick={handleOpenDecisionModal}>
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
          <DecisionModal
            open={openDecisionModal}
            setOpen={setOpenDecisionModal}
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
