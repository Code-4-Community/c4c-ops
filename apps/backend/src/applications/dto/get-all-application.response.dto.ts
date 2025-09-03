import {
  IsDate,
  IsEnum,
  IsPositive,
  IsString,
  IsArray,
  IsOptional,
} from 'class-validator';
import {
  ApplicationStage,
  Position,
  ReviewStage,
  ReviewStatus,
} from '../types';
import { AssignedRecruiterDTO } from './get-application.response.dto';

export class GetAllApplicationResponseDTO {
  @IsPositive()
  userId: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsEnum(ReviewStage)
  step: ReviewStage;

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

  @IsArray()
  @IsOptional()
  assignedRecruiters: AssignedRecruiterDTO[];
}
