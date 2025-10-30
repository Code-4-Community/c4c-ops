import { IsEmail, IsString } from 'class-validator';
import { SignInRequest } from '@shared/dto/request/auth.dto';

export class SignInRequestDto implements SignInRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
