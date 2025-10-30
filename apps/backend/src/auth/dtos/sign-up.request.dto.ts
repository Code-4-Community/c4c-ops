import { IsEmail, IsString } from 'class-validator';
import { SignUpRequest } from '@shared/dto/request/auth.dto';

export class SignUpRequestDTO implements SignUpRequest {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
