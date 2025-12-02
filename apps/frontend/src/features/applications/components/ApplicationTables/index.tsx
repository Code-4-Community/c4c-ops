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
import {
  getRecruitmentSemester as getCurrentSemester,
  getRecruitmentYear as getCurrentYear,
} from '@sharedTypes/utils/cycle';
import {
  dataGridStyles,
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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#181818',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          py: 4,
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ flexShrink: 0 }}
        >
          <img
            src={LOGO_PATHS.SQUARE}
            alt="C4C Logo"
            style={{ width: 50, height: 40 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Database | {getCurrentSemester()} {getCurrentYear()} Recruitment
            Cycle
          </Typography>
        </Stack>

        {showEmpty ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
          <Box sx={{ flex: 1, minHeight: 0 }}>
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
              sx={{
                ...dataGridStyles,
                cursor: 'pointer',
                height: '100%',
                width: '100%',
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
