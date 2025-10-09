import { useState, useEffect } from 'react';
import { Application } from '@sharedTypes/types/application.types';
import apiClient from '@api/apiClient';

/**
 * Custom hook for fetching a single application by user ID.
 *
 * @param accessToken - JWT access token for authentication
 * @param userId - The ID of the user whose application to fetch
 * @returns Object containing application data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { application, isLoading, error, refetch } = useApplication(accessToken, userId);
 * ```
 */
export const useApplication = (accessToken: string, userId: number | null) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplication = async () => {
    if (!userId || !accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const app = await apiClient.getApplication(accessToken, userId);
      setApplication(app);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch application'),
      );
      console.error('Error fetching application:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, userId]);

  return {
    application,
    isLoading,
    error,
    refetch: fetchApplication,
  };
};
