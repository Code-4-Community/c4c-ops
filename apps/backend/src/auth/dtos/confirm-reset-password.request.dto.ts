import { IsEmail, IsNumberString, IsString } from 'class-validator';

export class ConfirmResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNumberString()
  verificationCode: string;

  @IsString()
  newPassword: string;
}
