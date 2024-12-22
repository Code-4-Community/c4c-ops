import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class TokenExchangeResponseDTO {
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
