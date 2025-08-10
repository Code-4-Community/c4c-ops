import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '@mui/material';
import { Application, ApplicationRow } from '@components/types';
import useLoginContext from '@components/LoginPage/useLoginContext';
import IndividualApplicationDetails from '@components/ApplicationTables/individualApplication';

const IndividualApplication: React.FC = () => {
  const location = useLocation();
  const { token: accessToken } = useLoginContext();

  const { userRow, application } = location.state || {};

  if (!application || !userRow) {
    return (
      <Container maxWidth="xl">
        <div>
          No application data available. Please navigate from the applications
          list.
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <IndividualApplicationDetails
        selectedApplication={application}
        selectedUserRow={userRow}
        accessToken={accessToken}
      />
    </Container>
  );
};

export default IndividualApplication;
