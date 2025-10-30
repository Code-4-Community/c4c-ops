import { useState, useEffect } from 'react';
import { User } from '@sharedTypes/types/user.types';
import apiClient from '@api/apiClient';

/**
 * Custom hook for fetching current user data.
 *
 * @param accessToken - JWT access token for authentication
 * @returns Object containing user data, loading state, and error
 *
 * @example
 * ```tsx
 * const { user, isLoading, error } = useUserData(accessToken);
 * ```
 */
export const useUserData = (accessToken: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userData = await apiClient.getUser(accessToken);
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch user'),
        );
        console.error('Error fetching user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchUser();
    }
  }, [accessToken]);

  return { user, isLoading, error };
};

/**
 * Custom hook for fetching user's full name.
 *
 * @param accessToken - JWT access token for authentication
 * @returns Object containing full name, loading state, and error
 *
 * @example
 * ```tsx
 * const { fullName, isLoading } = useFullName(accessToken);
 * ```
 */
export const useFullName = (accessToken: string) => {
  const [fullName, setFullName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFullName = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const name = await apiClient.getFullName(accessToken);
        setFullName(name);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch full name'),
        );
        console.error('Error fetching full name:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchFullName();
    }
  }, [accessToken]);

  return { fullName, isLoading, error };
};
