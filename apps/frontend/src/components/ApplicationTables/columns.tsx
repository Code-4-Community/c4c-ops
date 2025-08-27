import { FilterList } from '@mui/icons-material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { GridColumnHeaderParams, GridRenderCellParams } from '@mui/x-data-grid';
import { REVIEWED_STATUSES, STAGE_STATUSES } from './constants';
import { RatingCell } from './RatingCell';

export const applicationColumns = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    headerAlign: 'left' as const,
    type: 'text',
    sortable: true, // Enable sorting
    disableColumnMenu: true,
    renderHeader: () => <strong>{'Name '}</strong>,
  },
  {
    field: 'position',
    headerName: 'Position',
    flex: 1,
    headerAlign: 'left' as const,
    type: 'text',
    sortable: true, // Enable sorting
    disableColumnMenu: true,
    renderHeader: (params: GridColumnHeaderParams) => (
      <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {'Position '}
        <SwapHorizIcon sx={{ fontSize: 16 }} />
      </strong>
    ),
  },
  {
    field: 'review',
    headerName: 'Review Stage',
    flex: 1,
    headerAlign: 'left' as const,
    type: 'singleSelect',
    valueOptions: REVIEWED_STATUSES,
    sortable: false,
    renderHeader: (params: GridColumnHeaderParams) => {
      return (
        <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {'Reviewed '}
          <FilterList sx={{ fontSize: 16 }} />
        </strong>
      );
    },
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    flex: 2,
    headerAlign: 'left' as const,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: () => <strong>{'Assigned To '}</strong>,
  },
  {
    field: 'stage',
    headerName: 'App Stage',
    flex: 1,
    headerAlign: 'left' as const,
    type: 'singleSelect',
    valueOptions: STAGE_STATUSES,
    sortable: false,
    renderHeader: (params: GridColumnHeaderParams) => {
      return (
        <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {'App Stage '}
          <FilterList sx={{ fontSize: 16 }} />
        </strong>
      );
    },
  },
  {
    field: 'rating',
    headerName: 'Rating',
    flex: 1,
    headerAlign: 'left' as const,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: () => <strong>{'Rating '}</strong>,
    renderCell: (params: GridRenderCellParams) => (
      <RatingCell value={params.value} row={params.row} />
    ),
  },
];
