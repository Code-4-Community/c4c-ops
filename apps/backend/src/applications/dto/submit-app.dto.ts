import { Response } from '../types';
import { IsPositive } from 'class-validator';

export class SubmitApplicationDto {
  @IsPositive()
  applicantId: number;

  application: Response[];
}
