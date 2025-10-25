import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import { ApplicationRow } from '@sharedTypes/types/application.types';
import { Container, Stack, Typography } from '@mui/material';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';
import { GridRowSelectionModel } from '@mui/x-data-grid/models/gridRowSelectionModel';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecruiterColumns } from './columns';
import { getCurrentSemester, getCurrentYear } from '@utils/semester';
import {
  dataGridStyles,
  defaultPaginationModel,
  defaultPageSizeOptions,
} from '@styles/dataGridTheme';
import { LOGO_PATHS } from '@constants/recruitment';
import { useApplicationData } from '@shared/hooks/useApplicationData';
import { useApplication } from '@shared/hooks/useApplication';

export function RecruiterTable() {
  const { token: accessToken } = useLoginContext();
  const { data } = useApplicationData(accessToken);
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
  const [selectedUserRow, setSelectedUserRow] = useState<ApplicationRow | null>(
    null,
  );

  const navigate = useNavigate();

  // Get userId from selected row
  const selectedUserId = selectedUserRow?.userId ?? null;
  const { application: selectedApplication } = useApplication(
    accessToken,
    selectedUserId,
  );

  /* Unsure about whether this logic is still needed
  useEffect(() => {
    if (rowSelection.length > 0) {
      setSelectedUserRow(data[rowSelection[0] as number]);
    }
  }, [rowSelection, data]);
  */

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" spacing={2} mt={4} mb={8}>
        <img
          src={LOGO_PATHS.STANDARD}
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
        sx={dataGridStyles}
        initialState={{
          pagination: {
            paginationModel: defaultPaginationModel,
          },
        }}
        pageSizeOptions={defaultPageSizeOptions}
          onRowClick={(params: GridRowParams<ApplicationRow>, event: any) => {
            const target = event.target as HTMLElement;
            // if the click originated from a checkbox (or element with role=checkbox), ignore it so checkbox selection still works
            if (
              target.closest('input[type="checkbox"], [role="checkbox"], .MuiDataGrid-checkboxInput, .MuiDataGrid-cellCheckbox')
            ) {
              return;
            }
            navigate(`/applications/${params.row.userId}`);
          }}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelection(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelection}
      />
    </Container>
  );
}
