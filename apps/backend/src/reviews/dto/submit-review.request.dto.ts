import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApplicationStage } from '../../applications/types';

export class SubmitReviewRequestDTO {
  @IsPositive()
  applicantId: number;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsNumber({}, { message: 'Rating must be a valid number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @IsString()
  content: string;
}
