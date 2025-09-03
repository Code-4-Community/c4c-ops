import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import { Application, User } from '@components/types';
import useLoginContext from '@components/LoginPage/useLoginContext';
import IndividualApplicationDetails from '@components/ApplicationTables/individualApplication';
import apiClient from '@api/apiClient';

const IndividualApplication: React.FC = () => {
  const { token: accessToken } = useLoginContext();

  const params = useParams();
  const userIdString = params.userIdString || params.userId || params.id;
  const userId = parseInt(userIdString || '');

  const [application, setApplication] = useState<Application | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetches application and user information to be passed into IndividualApplicationDetails
    const fetchData = async () => {
      if (!userId || isNaN(userId) || !accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const [application, user] = await Promise.all([
          apiClient.getApplication(accessToken, userId),
          apiClient.getUserById(accessToken, userId),
        ]);

        setApplication(application);
        setUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken, userId]);

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
      />
    </Container>
  );
};

export default IndividualApplication;
