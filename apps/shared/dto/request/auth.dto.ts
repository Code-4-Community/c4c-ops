/**
 * Authentication request DTOs
 */

/**
 * Sign in request interface
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Sign up request interface
 */
export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
