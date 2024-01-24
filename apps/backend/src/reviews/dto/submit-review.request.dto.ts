import { IsEnum, IsPositive, IsString } from 'class-validator';
import { Rating, Stage } from '../types';

export class SubmitReviewRequestDTO {
  @IsPositive()
  applicantId: number;

  @IsEnum(Stage)
  stage: Stage;

  @IsEnum(Rating)
  rating: Rating;

  @IsString()
  content: string;
}
