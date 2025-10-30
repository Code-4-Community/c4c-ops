import { IsJWT, IsString, IsOptional } from 'class-validator';

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
