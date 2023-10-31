import { IsEmail, IsNumber } from 'class-validator';

export class VerifyUserDto {
  @IsEmail()
  email: string;

  @IsNumber()
  verificationCode: number;
}
