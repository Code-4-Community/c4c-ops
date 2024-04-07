import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail()
  email: string;
}
