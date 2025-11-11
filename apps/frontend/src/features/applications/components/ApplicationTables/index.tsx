import { useState } from 'react';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack } from '@mui/material';

import {
  ApplicationRow,
  AssignedRecruiter,
} from '@sharedTypes/types/application.types';
import { applicationColumns } from './columns';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import {
  getRecruitmentSemester as getCurrentSemester,
  getRecruitmentYear as getCurrentYear,
} from '@sharedTypes/utils/cycle';
import {
  defaultPaginationModel,
  defaultPageSizeOptions,
} from '@styles/dataGridTheme';
import { LOGO_PATHS } from '@constants/recruitment';
import { useApplicationData } from '@shared/hooks/useApplicationData';

export function ApplicationTable() {
  const navigate = useNavigate();
  const { token: accessToken } = useLoginContext();
  const { data } = useApplicationData(accessToken);
  const [allRecruiters] = useState<AssignedRecruiter[]>([]);

  const handleRowClick = (params: GridRowParams<ApplicationRow>) => {
    navigate(`/applications/${params.row.userId}`);
  };
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
    </Container>
  );
}
