import { IsEmail, IsString } from 'class-validator';

export class SignInRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
