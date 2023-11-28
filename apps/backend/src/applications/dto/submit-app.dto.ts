import { IsEmail } from 'class-validator';
import { Response } from '../types';

export class SubmitApplicationDto {
  @IsEmail()
  email: string;
  signature: string;

  application: Response[];
}
