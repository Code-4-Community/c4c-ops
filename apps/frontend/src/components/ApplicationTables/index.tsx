import { useEffect, useState, useRef } from 'react';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Checkbox,
  TextField,
  Autocomplete,
} from '@mui/material';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { DoneOutline } from '@mui/icons-material';

import { ApplicationRow, Application, Semester, User } from '../types';
import apiClient from '@api/apiClient';
import { applicationColumns } from './columns';
import { ReviewModal } from './reviewModal';
import { ConfirmModal } from './confirmModal';
import useLoginContext from '@components/LoginPage/useLoginContext';
import { debounce } from 'lodash';

const TODAY = new Date();

const checkBoxIconUnchecked = <CheckBoxOutlineBlank fontSize="small" />;
const checkBoxIconChecked = <CheckBox fontSize="small" />;

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
  const [allRecruitersList, setAllRecruitersList] = useState<Array<User>>([]);
  const [selectedApplicationRecruiters, setSelectedApplicationRecruiters] =
    useState<User[]>([]);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const fetchRecruiters = async () => {
    const data = await apiClient.getAllRecruiters(accessToken);
    setAllRecruitersList(data);
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
      setSelectedApplicationRecruiters(application.recruiters ?? []);
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to fetch application details.');
    }
  };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true);
  };

  const handleRecruitersChange = debounce(
    async (event: React.SyntheticEvent, newRecruiters: User[]) => {
      event.preventDefault();

      if (selectedApplication) {
        try {
          await apiClient.updateAssignedRecruiters(
            accessToken,
            selectedApplication.id,
            newRecruiters,
          );
          const updatedApp = await apiClient.getApplication(
            accessToken,
            selectedApplication.user.id,
          );

          setSelectedApplication(updatedApp);
          setSelectedApplicationRecruiters(updatedApp.recruiters);
        } catch (error) {
          console.error('Error updating the database: ' + error);
        }
      }
    },
    1000,
  );

  useEffect(() => {
    if (isPageRendered.current) {
      fetchData();
      getFullName();
    }
    isPageRendered.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, data]);

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
          getApplication(data[newRowSelectionModel[0] as number].userId);
          fetchRecruiters();
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
            <Typography>
              # Events Attended: {selectedApplication.eventsAttended}
            </Typography>
          </Stack>
          <Autocomplete
            multiple
            options={allRecruitersList}
            disableCloseOnSelect
            getOptionLabel={(recruiter) =>
              recruiter.firstName + ' ' + recruiter.lastName
            }
            value={selectedApplicationRecruiters}
            onChange={(event, newRecruiters) => {
              setSelectedApplicationRecruiters(newRecruiters);
              handleRecruitersChange(event, newRecruiters);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } =
                props as React.HTMLAttributes<HTMLLIElement> & {
                  key: string;
                };
              return (
                <li key={key} {...optionProps}>
                  <Checkbox
                    icon={checkBoxIconUnchecked}
                    checkedIcon={checkBoxIconChecked}
                    checked={selected}
                  />
                  {option.firstName + ' ' + option.lastName}
                </li>
              );
            }}
            style={{ width: 400, marginTop: 10 }}
            renderInput={(params) => (
              <TextField {...params} label="Assign Recruiter(s)" />
            )}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleOpenConfirmModal}
          >
            Check Into Event
          </Button>
          <ConfirmModal
            open={openConfirmModal}
            setOpen={setOpenConfirmModal}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            accessToken={accessToken}
          />
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
