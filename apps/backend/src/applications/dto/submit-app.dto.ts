import { Response } from '../types';
import { IsNumber, IsPositive } from 'class-validator';

export class SubmitApplicationDto {
  @IsNumber()
  @IsPositive()
  applicantId: number;

  application: Response[];
}
