import { useState } from 'react';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, Box } from '@mui/material';

import {
  ApplicationRow,
  AssignedRecruiter,
} from '@sharedTypes/types/application.types';
import { applicationColumns } from './columns';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import { getCurrentSemester, getCurrentYear } from '@utils/semester';
import {
  defaultPaginationModel,
  defaultPageSizeOptions,
} from '@styles/dataGridTheme';
import { LOGO_PATHS } from '@constants/recruitment';
import { useApplicationData } from '@shared/hooks/useApplicationData';

export function ApplicationTable() {
  const navigate = useNavigate();
  const { token: accessToken } = useLoginContext();
  const { data, isLoading, error } = useApplicationData(accessToken);
  const [allRecruiters] = useState<AssignedRecruiter[]>([]);

  const handleRowClick = (params: GridRowParams<ApplicationRow>) => {
    navigate(`/applications/${params.row.userId}`);
  };
  const showEmpty = !isLoading && !error && data.length === 0;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" spacing={2} mt={4} mb={8}>
        <img
          src={LOGO_PATHS.SQUARE}
          alt="C4C Logo"
          style={{ width: 50, height: 40 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Database | {getCurrentSemester()} {getCurrentYear()} Recruitment Cycle
        </Typography>
      </Stack>
      {showEmpty ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: 2,
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            There are no applications at this time
          </Typography>
        </Box>
      ) : (
        <DataGrid
          rows={data}
          columns={applicationColumns(allRecruiters)}
          initialState={{
            pagination: {
              paginationModel: defaultPaginationModel,
            },
          }}
          pageSizeOptions={defaultPageSizeOptions}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          sx={{ cursor: 'pointer' }}
        />
      )}
    </Container>
  );
}
