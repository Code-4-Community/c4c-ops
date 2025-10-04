import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

/**
 * Simple DTO for refresh token request, just contains a non-tempy string refresh token.
 */
export class RefreshTokenRequestDTO {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
