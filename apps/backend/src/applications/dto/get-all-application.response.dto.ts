import { IsDate, IsEnum, IsPositive, IsString } from 'class-validator';
import {
  ApplicationStage,
  ApplicationStep,
  Position,
  ReviewStatus,
} from '../types';

export class GetAllApplicationResponseDTO {
  @IsPositive()
  userId: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsEnum(ApplicationStep)
  step: ApplicationStep;

  @IsEnum(ReviewStatus)
  review: ReviewStatus;

  @IsEnum(Position)
  position: Position;

  @IsDate()
  createdAt: Date;

  @IsPositive()
  meanRatingAllReviews: number;

  @IsPositive()
  meanRatingResume: number;

  @IsPositive()
  meanRatingChallenge: number;

  @IsPositive()
  meanRatingTechnicalChallenge: number;

  @IsPositive()
  meanRatingInterview: number;
}
