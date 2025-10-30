import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';
import { TokenExchangeResponse } from '@shared/dto/response/auth.dto';

export class TokenExchangeResponseDTO implements TokenExchangeResponse {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;

  @IsString()
  id_token: string;

  @IsString()
  token_type: string;

  @IsNumberString()
  expires_in: number;
}
