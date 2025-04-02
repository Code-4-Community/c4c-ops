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
  Box,
} from '@mui/material';
import { DoneOutline } from '@mui/icons-material';

import { ApplicationRow, Application, Semester } from '../types';
import apiClient from '@api/apiClient';
import { applicationColumns } from './columns';
import useLoginContext from '@components/LoginPage/useLoginContext';
import { ReviewPanel } from './reviewPanel';

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
  const [userStatus, setUserStatus] = useState<string>('');

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

  // const changeStage = async (
  //   event: React.MouseEvent<HTMLButtonElement>,
  //   userId: number,
  // ) => {
  //   console.log(`Attempting to change stage for userId: ${userId}`);
  //   try {
  //     const updatedApplication = await apiClient.changeStage(
  //       accessToken,
  //       userId,
  //     );
  //     console.log('Stage changed successfully:', updatedApplication.stage);
  //     alert(`Stage updated to: ${updatedApplication.stage}`);
  //   } catch (error) {
  //     console.error('Error changing application stage:', error);
  //     alert('Failed to change application stage.');
  //   }
  // };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
    console.log(userStatus);
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

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await apiClient.getStatus(accessToken);
      setUserStatus(status);
    };
    fetchStatus();
  }, [accessToken]);

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
          <Stack spacing={2} direction="row" mt={1} flexWrap="wrap">
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

          <Stack direction="row" spacing={4} mt={4} alignItems="flex-start">
            {/* Left Panel: Application Responses */}
            <Box flex={2}>
              <Typography variant="body1" mt={2}>
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
            </Box>

            {/* Right Panel: Review Input Form */}
            <Box flex={1}>
              <ReviewPanel
                selectedUserRow={selectedUserRow}
                selectedApplication={selectedApplication}
                accessToken={accessToken}
                currentUserFullName={fullName}
                currentUserStatus={userStatus}
              />
            </Box>
          </Stack>
        </>
      ) : null}
    </Container>
  );
}
