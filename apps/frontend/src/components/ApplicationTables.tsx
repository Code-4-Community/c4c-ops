import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import apiClient from '@api/apiClient';
enum ApplicationStage {
  RESUME = 'RESUME',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',

  // Devs only
  TECHNICAL_CHALLENGE = 'TECHNICAL_CHALLENGE',
  // PMs only
  PM_CHALLENGE = 'PM_CHALLENGE',
}
enum Position {
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

export type applicationRow = {
  id: number;
  fullName: string;
  email: string;
  position: Position;
  stage: ApplicationStage;
  numApps: number;
  createdAt?: string;
};

export function ApplicationTable() {
  // { rows }: { rows: applicationRow[] }
  const [data, setData] = useState([] as applicationRow[]);
  const fetchData = async () => {
    const data: applicationRow[] = await apiClient.getFake(); // eslint-disable-line
    data.forEach((row, index) => {
      row.id = index;
    });
    setData(data);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <DataGrid
      rows={data}
      columns={[
        { field: 'fullName' },
        { field: 'email' },
        { field: 'position' },
        { field: 'stage' },
        { field: 'numApps' },
      ]}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 5 },
        },
      }}
      pageSizeOptions={[5, 10]}
      checkboxSelection
    />
  );
}
