import { Application, ApplicationRow, User } from '@components/types';

export const applicationColumns = [
  {
    field: 'firstName',
    headerName: 'First Name',
    width: 150,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    width: 150,
  },
  {
    field: 'stage',
    headerName: 'Stage',
    width: 125,
  },
  {
    field: 'step',
    headerName: 'Status',
    width: 125,
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 150,
  },
  {
    field: 'createdAt',
    headerName: 'Date',
    width: 150,
  },
  {
    field: 'recruiters',
    headerName: 'Assigned Recruiters',
    width: 150,
    valueGetter: (params: { row: ApplicationRow }) =>
      params.row.recruiters
        ?.map(
          (recruiter: User) => `${recruiter.firstName} ${recruiter.lastName}`,
        )
        .join(', ') ?? 'None',
  },
  {
    field: 'meanRatingAllStages',
    headerName: 'Rating All Stages',
    width: 150,
  },
  {
    field: 'meanRatingSingleStages',
    headerName: 'Rating Single Stage',
    width: 150,
  },
  {
    field: 'eventsAttended',
    headerName: 'Events Attended',
    width: 150,
  },
];
