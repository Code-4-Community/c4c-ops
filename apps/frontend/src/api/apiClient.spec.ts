import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { handleTokenRefresh } from './apiClient';
import { getStoredTokens, updateAccessToken } from '../utils/tokenUtils';
import { ApiClient } from './apiClient';

// Mock the tokenUtils module
vi.mock('../utils/tokenUtils', () => ({
  getStoredTokens: vi.fn(),
  updateAccessToken: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock console methods to avoid cluttering test output
const mockConsoleLog = vi
  .spyOn(console, 'log')
  .mockImplementation(() => undefined);
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

describe('handleTokenRefresh', () => {
  let mockGetStoredTokens: ReturnType<typeof vi.fn>;
  let mockUpdateAccessToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockLocalStorage.clear();

    mockGetStoredTokens = getStoredTokens as ReturnType<typeof vi.fn>;
    mockUpdateAccessToken = updateAccessToken as ReturnType<typeof vi.fn>;
  });

  afterAll(() => {
    // Restore console methods after all tests
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('when no tokens are available', () => {
    it('should return null when getStoredTokens returns null', async () => {
      mockGetStoredTokens.mockReturnValue(null);

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('No refresh token available');
      expect(mockUpdateAccessToken).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return null when getStoredTokens returns undefined', async () => {
      mockGetStoredTokens.mockReturnValue(undefined as any);

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('No refresh token available');
      expect(mockUpdateAccessToken).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return null when tokens exist but refreshToken is missing', async () => {
      mockGetStoredTokens.mockReturnValue({
        accessToken: 'some-access-token',
        refreshToken: '',
      });

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('No refresh token available');
      expect(mockUpdateAccessToken).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return null when tokens exist but refreshToken is null', async () => {
      mockGetStoredTokens.mockReturnValue({
        accessToken: 'some-access-token',
        refreshToken: null as any,
      });

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('No refresh token available');
      expect(mockUpdateAccessToken).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('when token refresh is successful', () => {
    it('should return new access token and update stored tokens', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      const mockNewAccessToken = 'new-access-token';

      mockGetStoredTokens.mockReturnValue({
        accessToken: 'old-access-token',
        refreshToken: mockRefreshToken,
      });

      // Mock the ApiClient's refreshAccessToken method
      const mockRefreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: mockNewAccessToken,
      });
      vi.spyOn(ApiClient.prototype, 'refreshAccessToken').mockImplementation(
        mockRefreshAccessToken,
      );

      const result = await handleTokenRefresh();

      expect(result).toBe(mockNewAccessToken);
      expect(mockRefreshAccessToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockUpdateAccessToken).toHaveBeenCalledWith(mockNewAccessToken);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('when token refresh fails', () => {
    it('should return null and clear tokens when refresh throws an error', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      const mockError = new Error('Network error');

      mockGetStoredTokens.mockReturnValue({
        accessToken: 'old-access-token',
        refreshToken: mockRefreshToken,
      });

      // Mock the ApiClient's refreshAccessToken to throw an error
      const mockRefreshAccessToken = vi.fn().mockRejectedValue(mockError);
      vi.spyOn(ApiClient.prototype, 'refreshAccessToken').mockImplementation(
        mockRefreshAccessToken,
      );

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockRefreshAccessToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Token refresh failed:',
        mockError,
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
      expect(mockUpdateAccessToken).not.toHaveBeenCalled();
    });

    it('should handle API client errors gracefully', async () => {
      const mockRefreshToken = 'mock-refresh-token';

      mockGetStoredTokens.mockReturnValue({
        accessToken: 'old-access-token',
        refreshToken: mockRefreshToken,
      });

      // Mock the ApiClient's refreshAccessToken to throw a string error
      const mockRefreshAccessToken = vi.fn().mockRejectedValue('Unknown error');
      vi.spyOn(ApiClient.prototype, 'refreshAccessToken').mockImplementation(
        mockRefreshAccessToken,
      );

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Token refresh failed:',
        'Unknown error',
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
    });

    it('should clear tokens when refresh returns invalid response', async () => {
      const mockRefreshToken = 'mock-refresh-token';

      mockGetStoredTokens.mockReturnValue({
        accessToken: 'old-access-token',
        refreshToken: mockRefreshToken,
      });

      // Mock the ApiClient's refreshAccessToken to throw due to invalid response
      const mockRefreshAccessToken = vi
        .fn()
        .mockRejectedValue(new Error('Invalid response'));
      vi.spyOn(ApiClient.prototype, 'refreshAccessToken').mockImplementation(
        mockRefreshAccessToken,
      );

      const result = await handleTokenRefresh();

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
    });
  });
});
