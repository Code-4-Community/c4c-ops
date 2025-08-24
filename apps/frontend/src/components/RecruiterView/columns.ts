export const RecruiterColumns = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 150,
  },
  {
    field: 'review',
    headerName: 'Review',
    width: 125,
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
        return 'None Assigned';
      }
      return recruiters
        .map((recruiter) => `${recruiter.firstName} ${recruiter.lastName}`)
        .join(', ');
    },
  },
  {
    field: 'stage',
    headerName: 'App Stage',
    width: 150,
  },
  {
    field: 'rating',
    headerName: 'Rating',
    width: 125,
  },
];
