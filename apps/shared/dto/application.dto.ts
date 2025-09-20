/**
 * Application DTOs with validation
 * These are shared between frontend and backend
 */

import {
  IsPositive,
  IsString,
  IsOptional,
  IsDate,
  IsEnum,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApplicationStage,
  StageProgress,
  Position,
  Response,
  Semester,
  ReviewStatus,
  Review,
} from '../types/application.types';

/**
 * Assigned recruiter DTO
 */
export class AssignedRecruiterDTO {
  @IsPositive()
  id: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  assignedAt?: Date;
}

/**
 * Get single application response DTO
 */
export class GetApplicationResponseDTO {
  @IsPositive()
  id: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsNumber()
  year: number;

  @IsEnum(Semester)
  semester: Semester;

  @IsEnum(Position)
  position: Position;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsEnum(StageProgress)
  stageProgress: StageProgress;

  @IsEnum(ReviewStatus)
  reviewStatus: ReviewStatus;

  @IsArray()
  response: Response[];

  @IsArray()
  reviews: Review[];

  @IsNumber()
  numApps: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignedRecruiterDTO)
  assignedRecruiters: AssignedRecruiterDTO[];
}

/**
 * Get all applications response DTO
 */
export class GetAllApplicationResponseDTO {
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
