import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  ApplicationRow,
  AssignedRecruiter,
} from '@sharedTypes/types/application.types';
import { REVIEWED_STATUSES, STAGE_STATUSES } from './constants';
import { RatingCell } from './RatingCell';
import { FilterList } from '@mui/icons-material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { mapEnumKeyToStageValue } from '@utils/tableFormatters';

export const applicationColumns = (
  allRecruiters: AssignedRecruiter[],
): GridColDef<ApplicationRow>[] => [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    headerAlign: 'left',
    type: 'string',
    sortable: true,
    disableColumnMenu: true,
    renderHeader: (): React.ReactNode => <strong>Name</strong>,
  },
  {
    field: 'position',
    headerName: 'Position',
    flex: 1,
    headerAlign: 'left',
    type: 'string',
    sortable: true,
    disableColumnMenu: true,
    renderHeader: (): React.ReactNode => (
      <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        Position <SwapHorizIcon sx={{ fontSize: 16 }} />
      </strong>
    ),
  },
  {
    field: 'reviewed',
    headerName: 'Review Stage',
    flex: 1,
    headerAlign: 'left',
    type: 'singleSelect',
    valueOptions: [...REVIEWED_STATUSES],
    sortable: true,
    renderHeader: (): React.ReactNode => (
      <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        Reviewed <FilterList sx={{ fontSize: 16 }} />
      </strong>
    ),
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned to:',
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (
      params: GridRenderCellParams<ApplicationRow>,
    ): React.ReactNode => {
      const recruiters = params.value as {
        id: number;
        firstName: string;
        lastName: string;
      }[];

      if (!recruiters || recruiters.length === 0) {
        return <span style={{ color: '#888' }}>None assigned</span>;
      }

      return recruiters.map((r) => `${r.firstName} ${r.lastName}`).join(', ');
    },
  },
  {
    field: 'stage',
    headerName: 'App Stage',
    flex: 1,
    headerAlign: 'left',
    type: 'singleSelect',
    valueOptions: [...STAGE_STATUSES], // ← spread to fix readonly type
    sortable: true,
    renderHeader: (): React.ReactNode => (
      <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        App Stage <FilterList sx={{ fontSize: 16 }} />
      </strong>
    ),
    renderCell: (
      params: GridRenderCellParams<ApplicationRow>,
    ): React.ReactNode => {
      // Use the mapping to show a human-readable value
      return mapEnumKeyToStageValue(params.value as string);
    },
  },
  {
    field: 'rating',
    headerName: 'Rating',
    flex: 1,
    headerAlign: 'left',
    sortable: true,
    disableColumnMenu: true,
    renderHeader: (): React.ReactNode => <strong>Rating</strong>,
    renderCell: (
      params: GridRenderCellParams<ApplicationRow>,
    ): React.ReactNode => <RatingCell value={params.value} row={params.row} />,
  },
];
