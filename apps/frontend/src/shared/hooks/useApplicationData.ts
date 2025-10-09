import { useState, useEffect } from 'react';
import { ApplicationRow } from '@sharedTypes/types/application.types';
import apiClient from '@api/apiClient';

/**
 * Custom hook for fetching and managing application data.
 * Handles loading state and error handling for application lists.
 *
 * @param accessToken - JWT access token for authentication
 * @returns Object containing applications data, loading state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useApplicationData(accessToken);
 * ```
 */
export const useApplicationData = (accessToken: string) => {
  const [data, setData] = useState<ApplicationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const applications = await apiClient.getAllApplications(accessToken);

      // Each application needs an id for the DataGrid to work
      if (applications) {
        applications.forEach((row, index) => {
          row.id = index;
        });
        setData(applications);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch applications'),
      );
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
