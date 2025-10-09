import {
  IsPositive,
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApplicationStage,
  StageProgress,
  ReviewStatus,
  Position,
} from '@shared/types/application.types';
import { GetAllApplicationsResponse } from '@shared/dto/response/application.dto';
import { AssignedRecruiterDTO } from './assigned-recruiter.dto';

/**
 * Get all applications response DTO
 */
export class GetAllApplicationResponseDTO
  implements GetAllApplicationsResponse
{
  @IsPositive()
  userId: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsEnum(StageProgress)
  stageProgress: StageProgress;

  @IsEnum(ReviewStatus)
  reviewStatus: ReviewStatus;

  @IsEnum(Position)
  position: Position;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsNumber()
  @IsOptional()
  meanRatingAllReviews: number | null;

  @IsNumber()
  @IsOptional()
  meanRatingResume: number | null;

  @IsNumber()
  @IsOptional()
  meanRatingChallenge: number | null;

  @IsNumber()
  @IsOptional()
  meanRatingTechnicalChallenge: number | null;

  @IsNumber()
  @IsOptional()
  meanRatingInterview: number | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignedRecruiterDTO)
  @IsOptional()
  assignedRecruiters: AssignedRecruiterDTO[];
}
