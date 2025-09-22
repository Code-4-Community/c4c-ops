/**
 * Authentication DTOs with validation
 * These are shared between frontend and backend
 */

import { IsString, IsOptional, IsJWT } from 'class-validator';

/**
 * Sign in response DTO
 */
export class SignInResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  @IsOptional()
  idToken?: string;
}

/**
 * JWT token response DTO
 */
export class TokenResponseDto {
  @IsJWT()
  token: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
