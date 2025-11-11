import { useState, useEffect, useCallback } from 'react';
import { Application } from '@sharedTypes/types/application.types';
import { User } from '@sharedTypes/types/user.types';
import apiClient from '@api/apiClient';

interface UseApplicationDetailsResult {
  application: Application | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches both the application and user details for a given userId.
 * Provides a refetch function so consumers can refresh (e.g., after submitting a review).
 */
export const useApplicationDetails = (
  accessToken: string | null,
  userId: number | null,
): UseApplicationDetailsResult => {
  const [application, setApplication] = useState<Application | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!accessToken || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [app, userData] = await Promise.all([
        apiClient.getApplication(accessToken, userId),
        apiClient.getUserById(accessToken, userId),
      ]);
      setApplication(app);
      setUser(userData);
    } catch (err) {
      const errorInstance =
        err instanceof Error ? err : new Error('Failed to fetch application');
      setError(errorInstance);
      console.error('Error fetching application details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    application,
    user,
    isLoading,
    error,
    refetch: fetchData,
  };
};
