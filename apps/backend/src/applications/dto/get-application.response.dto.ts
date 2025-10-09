import { IsPositive, IsDate, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApplicationStage,
  StageProgress,
  Semester,
  Position,
  ReviewStatus,
  Response,
  Review,
} from '@shared/types/application.types';
import { GetApplicationResponse } from '@shared/dto/response/application.dto';
import { AssignedRecruiterDTO } from './assigned-recruiter.dto';

/**
 * Get single application response DTO
 */
export class GetApplicationResponseDTO implements GetApplicationResponse {
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
  assignedRecruiters: AssignedRecruiterDTO[];
}
