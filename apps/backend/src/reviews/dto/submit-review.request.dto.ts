import { IsNumber, IsString } from 'class-validator';
import { ApplicationStage } from '../../applications/types';

export class SubmitReviewRequestDTO {
  @IsNumber()
  applicantId: number;

  @IsNumber()
  rating: number;

  @IsString()
  content: string;

  @IsString()
  stage: ApplicationStage;
}
