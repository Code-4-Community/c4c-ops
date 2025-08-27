import React, { useEffect, useState } from 'react';
import { ApplicationTable } from '@components/ApplicationTables';
import { RecruiterTable } from '@components/RecruiterView/Table';
import { User } from '@components/types';
import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';

const Applications: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { token: accessToken } = useLoginContext();

  const getUser = async () => {
    try {
      const currentUser = await apiClient.getUser(accessToken);
      setCurrentUser(currentUser);
    } catch (error) {
      console.error('Error fetching User:', error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!currentUser) return <div>Loading...</div>;
  else console.log('Current user is ', currentUser);

  return (
    <>
      {currentUser.status === 'Recruiter' ? (
        <RecruiterTable />
      ) : (
        <ApplicationTable />
      )}
    </>
  );
};

export default Applications;
