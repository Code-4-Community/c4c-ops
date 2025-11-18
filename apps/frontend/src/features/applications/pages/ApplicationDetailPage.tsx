import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import IndividualApplicationDetails from '@features/applications/components/ApplicationTables/individualApplication';
import { useApplicationDetails } from '@shared/hooks/useApplicationDetails';

const IndividualApplication: React.FC = () => {
  const { token: accessToken } = useLoginContext();

  const params = useParams();
  const userIdString = params.userIdString || params.userId || params.id;
  const userId = parseInt(userIdString || '');

  const { application, user, isLoading, refetch } = useApplicationDetails(
    accessToken,
    isNaN(userId) ? null : userId,
  );

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <div>Loading...</div>
      </Container>
    );
  }

  if (!application || !user) {
    return <Navigate to="/applications" />;
  }

  return (
    <Container maxWidth="xl">
      <IndividualApplicationDetails
        selectedApplication={application}
        selectedUser={user}
        accessToken={accessToken}
        onRefreshApplication={refetch}
      />
    </Container>
  );
};

export default IndividualApplication;
