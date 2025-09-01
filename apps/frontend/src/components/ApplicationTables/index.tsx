import { useEffect, useState } from 'react';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack } from '@mui/material';

import { ApplicationRow, AssignedRecruiter, Semester } from '../types';
import apiClient from '@api/apiClient';
import { applicationColumns } from './columns';
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
  const navigate = useNavigate();

  const { token: accessToken } = useLoginContext();
  // TODO implement auto token refresh
  const [data, setData] = useState<ApplicationRow[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [allRecruiters, setAllRecruiters] = useState<AssignedRecruiter[]>([]);

  const handleRowClick = async (params: GridRowParams<ApplicationRow>) => {
    // navigate to application page by userId
    console.log('Navigating to application of userId:', params.row.userId);
    console.log('token:', accessToken);
    const application = await apiClient.getApplication(
      accessToken,
      params.row.userId,
    );
    console.log('application:', application);
    navigate(`/applications/${params.row.userId}`);
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

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  useEffect(() => {
    fetchData();
    getFullName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);
  console.log('data', data);
  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" spacing={2} mt={4} mb={8}>
        <img
          src="/c4c-square.svg"
          alt="C4C Logo"
          style={{ width: 50, height: 40 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Database | {getCurrentSemester()} {getCurrentYear()} Recruitment Cycle
        </Typography>
      </Stack>
      <DataGrid
        rows={data}
        columns={applicationColumns(allRecruiters)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        sx={{ cursor: 'pointer' }}
      />
    </Container>
  );
}
