import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import { Container, Typography, Stack, Button } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import apiClient from '@api/apiClient';

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

export function ApplicationTable() {
  const isPageRendered = useRef<boolean>(false);

  const [data, setData] = useState<applicationRow[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
  const [selectedUser, setSelectedUser] = useState<applicationRow | null>(null);

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
        }}
        rowSelectionModel={rowSelection}
      />
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          marginTop: 3,
        }}
      >
        <Typography variant="h6">
          {selectedUser
            ? `Selected User: ${selectedUser.firstName} ${selectedUser.lastName}`
            : 'No User Selected'}
        </Typography>
        {selectedUser && (
          <Button variant="contained" size="small">
            View Application
          </Button>
        )}
      </Stack>
    </Container>
  );
}
