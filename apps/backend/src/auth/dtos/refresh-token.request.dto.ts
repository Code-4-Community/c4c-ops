import { IsString, IsNotEmpty } from 'class-validator';
import { RefreshTokenRequest } from '@shared/dto/request/auth.dto';

/**
 * DTO for refresh token request, implements the shared RefreshTokenRequest interface
 */
export class RefreshTokenRequestDTO implements RefreshTokenRequest {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
