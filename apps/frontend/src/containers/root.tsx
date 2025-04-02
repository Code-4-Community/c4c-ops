import { ApplicationTable } from '@components/ApplicationTables';
import { ApplicantView } from '@components/ApplicantView/user';
import useLoginContext from '@components/LoginPage/useLoginContext';
import apiClient from '@api/apiClient';
import { useEffect, useState } from 'react';
import { User } from '@components/types';
const Root: React.FC = () => {
  const { token: accessToken } = useLoginContext();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const getUser = async () => {
      setUser(await apiClient.getUser(accessToken));
    };
    getUser();
  }, [accessToken]);

  if (user?.status === 'Admin' || user?.status === 'Recruiter') {
    return <ApplicationTable />;
  } else if (user?.status === 'Applicant') {
    return <ApplicantView user={user} />;
  }

  return <div></div>;
};

export default Root;
