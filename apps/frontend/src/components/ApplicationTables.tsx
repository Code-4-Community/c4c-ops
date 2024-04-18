import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import apiClient from '@api/apiClient';
import { DoneOutline } from '@mui/icons-material';

enum ApplicationStage {
  RESUME = 'RESUME',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  TECHNICAL_CHALLENGE = 'TECHNICAL_CHALLENGE',
  PM_CHALLENGE = 'PM_CHALLENGE',
}

export enum ApplicationStep {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

enum Position {
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

export type applicationRow = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  stage: ApplicationStage;
  step: ApplicationStep;
  position: Position;
  createdAt: string;
  meanRatingAllStages: number;
  meanRatingSingleStages: number;
};

type Response = {
  question: string;
  answer: string;
};

export type Application = {
  id: number;
  createdAt: Date;
  year: number;
  semester: 'FALL' | 'SPRING';
  position: Position;
  stage: ApplicationStage;
  step: ApplicationStep;
  response: Response[];
  numApps: number;
};

export function ApplicationTable() {
  const isPageRendered = useRef<boolean>(false);

  const [data, setData] = useState<applicationRow[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
  const [selectedUser, setSelectedUser] = useState<applicationRow | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

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
    const application = await apiClient.getApplication(accessToken, userId);
    setSelectedApplication(application);
  };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  useEffect(() => {
    // Access token comes from OAuth redirect uri https://frontend.com/#access_token=access_token
    const hash = window.location.hash;
    const accessTokenMatch = hash.match(/access_token=([^&]*)/);
    if (accessTokenMatch) {
      setAccessToken(accessTokenMatch[1]);
    }
    isPageRendered.current = false;
  }, []);

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
      setSelectedUser(data[rowSelection[0] as number]);
    }
  }, [rowSelection, data]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" mb={3}>
        Welcome back, {fullName}
      </Typography>
      <DataGrid
        rows={data}
        columns={[
          {
            field: 'firstName',
            headerName: 'First Name',
            width: 150,
          },
          {
            field: 'lastName',
            headerName: 'Last Name',
            width: 150,
          },
          {
            field: 'stage',
            headerName: 'Stage',
            width: 125,
          },
          {
            field: 'step',
            headerName: 'Status',
            width: 125,
          },
          {
            field: 'position',
            headerName: 'Position',
            width: 150,
          },
          {
            field: 'createdAt',
            headerName: 'Date',
            width: 150,
          },
          {
            field: 'meanRatingAllStages',
            headerName: 'Rating All Stages',
            width: 150,
          },
          {
            field: 'meanRatingSingleStages',
            headerName: 'Rating Single Stage',
            width: 150,
          },
        ]}
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
        {selectedUser
          ? `Selected User: ${selectedUser.firstName} ${selectedUser.lastName}`
          : 'No User Selected'}
      </Typography>
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
              Step: {selectedApplication.step}
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
        </>
      ) : null}
    </Container>
  );
}
