import { IsEmail, IsNumber } from 'class-validator';

export class VerifyUserRequestDTO {
  @IsEmail()
  email: string;

  @IsNumber()
  verificationCode: number;
}
