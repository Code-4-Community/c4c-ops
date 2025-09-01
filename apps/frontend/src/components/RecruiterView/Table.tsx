import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';
import { Application, ApplicationRow, Semester } from '@components/types';
import { Container, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GridRowSelectionModel } from '@mui/x-data-grid/models/gridRowSelectionModel';
import { useEffect, useRef, useState } from 'react';
import { RecruiterColumns } from './columns';

export function RecruiterTable() {
  const TODAY = new Date();

  const getCurrentSemester = (): Semester => {
    const month: number = TODAY.getMonth();
    if (month >= 1 && month <= 7) {
      return Semester.FALL; // Feb - Aug
    }
    return Semester.SPRING; // Sep - Jan
  };

  const getCurrentYear = (): number => {
    return TODAY.getFullYear();
  };

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

  const getApplication = async (userId: number) => {
    try {
      const application = await apiClient.getApplication(accessToken, userId);
      setSelectedApplication(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to fetch application details.');
    }
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

  useEffect(() => {
    if (rowSelection.length > 0) {
      setSelectedUserRow(data[rowSelection[0] as number]);
    }
  }, [rowSelection, data]);

  useEffect(() => {
    if (rowSelection.length > 0) {
      setSelectedUserRow(data[rowSelection[0] as number]);
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
      <DataGrid
        rows={data}
        columns={RecruiterColumns}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          boxShadow: 'none',
          backgroundColor: '#1E1E1E',
          color: 'white',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#1E1E1E',
            borderBottom: 'none',
            color: '#BDBDBD',
            fontSize: '0.85rem',
            boxShadow: 'none',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: 'none',
            boxShadow: 'none',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            borderRight: 'none',
            color: 'white',
            boxShadow: 'none',
            outline: 'none',
          },
          '& .MuiDataGrid-row': {
            borderBottom: 'none',
            boxShadow: 'none',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'purple',
            '&:hover': {
              backgroundColor: 'purple',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#1E1E1E',
            borderTop: 'none',
            color: '#BDBDBD',
            boxShadow: 'none',
          },
          '& .MuiDataGrid-toolbarContainer': {
            borderBottom: 'none',
            boxShadow: 'none',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelection(newRowSelectionModel);
          if (
            newRowSelectionModel.length > 0 &&
            data?.[newRowSelectionModel?.[0] as number]
          ) {
            getApplication(data?.[newRowSelectionModel?.[0] as number]?.userId);
          }
        }}
        rowSelectionModel={rowSelection}
      />
    </Container>
  );
}
