import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack } from '@mui/material';

import { ApplicationRow, Semester } from '../types';
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
  console.log('Access Token in Application Table: ', accessToken);
  // TODO implement auto token refresh
  const [data, setData] = useState<ApplicationRow[]>([]);
  console.log('Data: ', data);
  // TODO implement auto token refresh
  const [fullName, setFullName] = useState<string>('');

  const handleRowClick = async (params: { row: ApplicationRow }) => {
    // SHOULD ONLY BE ACCESSIBLE TO ADMIN AND RECRUITER (IF THEY ARE ASSIGNED TO THE APPLICATION)
    const application = await apiClient.getApplication(
      accessToken,
      params.row.userId,
    );
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
        columns={applicationColumns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        onRowClick={handleRowClick}
        sx={{ cursor: 'pointer' }}
      />
    </Container>
  );
}
