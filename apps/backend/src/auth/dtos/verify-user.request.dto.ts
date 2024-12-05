import { IsEmail, IsNumberString } from 'class-validator';

export class VerifyUserRequestDTO {
  @IsEmail()
  email: string;

  @IsNumberString()
  verificationCode: number;
}
