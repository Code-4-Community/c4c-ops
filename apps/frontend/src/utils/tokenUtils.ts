/**
 * Token response type, used in getToken method, returns access_token and refresh_token now
 */
export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
};

/**
 * Stored tokens type for localStorage
 */
export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

// Simple token helper functions
export const getStoredTokens = (): StoredTokens | null => {
  const stored = localStorage.getItem('auth_tokens');
  return stored ? JSON.parse(stored) : null;
};

export const updateAccessToken = (newAccessToken: string): void => {
  const tokens = getStoredTokens();
  if (tokens) {
    const updated = { ...tokens, accessToken: newAccessToken };
    localStorage.setItem('auth_tokens', JSON.stringify(updated));
  }
};
