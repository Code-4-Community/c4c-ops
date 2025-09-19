import { IsPositive, IsString, IsOptional, IsDate } from 'class-validator';
import { Review } from '../../reviews/review.entity';
import {
  ApplicationStage,
  StageProgress,
  Position,
  Response,
  Semester,
  ReviewStatus,
} from '../types';

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
  @IsOptional()
  assignedAt?: Date;
}

export class GetApplicationResponseDTO {
  id: number;

  createdAt: Date;

  year: number;

  semester: Semester;

  position: Position;

  stage: ApplicationStage;

  stageProgress: StageProgress;

  reviewStatus: ReviewStatus;

  response: Response[];

  reviews: Review[];

  numApps: number;

  assignedRecruiters: AssignedRecruiterDTO[];
}
