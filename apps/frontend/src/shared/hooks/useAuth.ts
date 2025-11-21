import { useState, useEffect } from 'react';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';

const verifier = CognitoJwtVerifier.create({
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  tokenUse: 'access',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
});

/**
 * Custom hook to manage authentication state
 *
 * Checks if user has a valid token in localStorage and verifies it.
 * Returns authentication state and sign out handler.
 */
export const useAuth = () => {
  const { setToken, token } = useLoginContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const localToken = localStorage.getItem('token');

      if (localToken) {
        try {
          const token = JSON.parse(localToken);
          await verifier.verify(token);
          setToken(token);
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Error verifying token:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [setToken]);

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_tokens');
    setToken('');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    signOut,
    token,
  };
};
