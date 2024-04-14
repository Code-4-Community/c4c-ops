import { DataGrid } from '@mui/x-data-grid';
import { Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
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
  const [data, setData] = useState<applicationRow[]>([]);

  const fetchData = async (accessToken: string) => {
    const data = await apiClient.getAllApplications(accessToken);
    // Each application needs an id for the DataGrid to work
    if (data) {
      data.forEach((row, index) => {
        row.id = index;
      });
      setData(data);
    }
  };

  useEffect(() => {
    // Access token comes from OAuth redirect uri https://frontend.com/#access_token=access_token
    const hash = window.location.hash;
    const accessToken = hash.match(/access_token=([^&]*)/);
    if (accessToken) {
      fetchData(accessToken[1]);
    }
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" mb={3}>
        Welcome back, User
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
        checkboxSelection
      />
    </Container>
  );
}
