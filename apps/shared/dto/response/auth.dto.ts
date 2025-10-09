/**
 * Authentication response DTOs
 */

/**
 * Sign in response interface
 */
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
}

/**
 * Token response interface
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
}

/**
 * Token exchange response interface
 */
export interface TokenExchangeResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}
