import { ApplicantView } from '@features/applicant/components/ApplicantView/user';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';
import { useUserData } from '@shared/hooks/useUserData';

const Root: React.FC = () => {
  const { token: accessToken } = useLoginContext();
  const { user } = useUserData(accessToken);

  // only applicants can see this now.
  if (user?.status === 'Applicant') {
    return <ApplicantView user={user} />;
  }

  return null;
};

export default Root;
