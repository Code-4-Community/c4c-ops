/**
 * Authentication-related types
 * These are shared between frontend and backend
 */

/**
 * JWT payload structure
 */
export interface JWTPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Auth token response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}
