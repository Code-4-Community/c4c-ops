import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApplicationStage } from '@shared/types/application.types';
import { SubmitReviewRequest } from '@shared/dto/request/review.dto';

export class SubmitReviewRequestDTO implements SubmitReviewRequest {
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
