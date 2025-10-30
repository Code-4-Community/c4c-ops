import { IsString, IsOptional } from 'class-validator';
import { SignInResponse } from '@shared/dto/response/auth.dto';

/**
 * Sign in response DTO
 */
export class SignInResponseDto implements SignInResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  @IsOptional()
  idToken?: string;
}
