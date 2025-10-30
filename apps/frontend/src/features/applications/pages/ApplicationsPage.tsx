import React from 'react';
import { ApplicationTable } from '@features/applications/components/ApplicationTables';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import { useUserData } from '@shared/hooks/useUserData';

const Applications: React.FC = () => {
  const { token: accessToken } = useLoginContext();
  const { user: currentUser, isLoading } = useUserData(accessToken);

  if (isLoading) return <div>Loading...</div>;
  if (!currentUser) return <div>No user data available</div>;

  return <ApplicationTable />;
};

export default Applications;
