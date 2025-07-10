import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useLoginContext from '@components/LoginPage/useLoginContext';
import apiClient from '@api/apiClient';
import { User } from '@components/types';
import { Box, CircularProgress } from '@mui/material';

const AdminRoutes: React.FC = () => {
  const { token: accessToken } = useLoginContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await apiClient.getUser(accessToken);
        setUser(userData);

        if (userData?.status === 'Applicant') {
          navigate('/applicant');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      getUser();
    }
  }, [accessToken, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user?.status === 'Admin' || user?.status === 'Recruiter') {
    return <Outlet />;
  }

  // this will be handled by the redirect in useeffect
  return null;
};

export default AdminRoutes;
