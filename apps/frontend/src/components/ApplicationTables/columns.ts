export const applicationColumns = [
  {
    field: 'firstName',
    headerName: 'First Name',
    width: 125,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    width: 125,
  },
  {
    field: 'stage',
    headerName: 'Stage',
    width: 150,
  },
  {
    field: 'step',
    headerName: 'Status',
    width: 125,
  },
  {
    field: 'review',
    headerName: 'Review',
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
    width: 125,
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
    field: 'assignedRecruiters',
    headerName: 'Assigned Recruiters',
    width: 200,
    renderCell: (params: any) => {
      const recruiters = params.value as Array<{
        firstName: string;
        lastName: string;
      }>;
      if (!recruiters || recruiters.length === 0) {
        return 'None assigned';
      }
      return recruiters
        .map((recruiter) => `${recruiter.firstName} ${recruiter.lastName}`)
        .join(', ');
    },
  },
];
