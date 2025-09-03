import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ApplicationRow, AssignedRecruiter } from '@components/types';
import { REVIEWED_STATUSES, STAGE_STATUSES } from './constants';
import { RatingCell } from './RatingCell';
import { FilterList } from '@mui/icons-material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Helper to format text (e.g., capitalize, replace underscores)
const formatText = (text: string): string => {
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace('App Received', 'Application Received');
};

export const formatStageName = (stage: string): string => {
  return formatText(stage);
};

export const mapStageStringToEnumKey = (stageString: string): string => {
  const stageMap: { [key: string]: string } = {
    'Application Received': 'APP_RECEIVED',
    'PM Challenge': 'PM_CHALLENGE',
    'Behavioral Interview': 'B_INTERVIEW',
    'Technical Interview': 'T_INTERVIEW',
    Accepted: 'ACCEPTED',
    Rejected: 'REJECTED',
    'Accepted/Rejected': 'ACCEPTED', // fallback for combined
  };
  return stageMap[stageString] || stageString;
};

export const mapEnumKeyToStageValue = (enumKey: string): string => {
  const keyToValueMap: { [key: string]: string } = {
    APP_RECEIVED: 'Application Received',
    PM_CHALLENGE: 'PM Challenge',
    B_INTERVIEW: 'Behavioral Interview',
    T_INTERVIEW: 'Technical Interview',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
  };
  return keyToValueMap[enumKey] || enumKey;
};

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
