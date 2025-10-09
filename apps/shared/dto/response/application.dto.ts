/**
 * Application response DTOs
 */

import {
  ApplicationStage,
  StageProgress,
  Position,
  Semester,
  ReviewStatus,
  Response,
  Review,
  AssignedRecruiter,
} from '../../types/application.types';

/**
 * Get single application response interface
 */
export interface GetApplicationResponse {
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
  assignedRecruiters: AssignedRecruiter[];
}

/**
 * Get all applications response interface
 */
export interface GetAllApplicationsResponse {
  userId: number;
  firstName: string;
  lastName: string;
  stage: ApplicationStage;
  stageProgress: StageProgress;
  reviewStatus: ReviewStatus;
  position: Position;
  assignedRecruiters: AssignedRecruiter[];
  createdAt: Date;
  meanRatingAllReviews: number | null;
  meanRatingResume: number | null;
  meanRatingChallenge: number | null;
  meanRatingTechnicalChallenge: number | null;
  meanRatingInterview: number | null;
}
