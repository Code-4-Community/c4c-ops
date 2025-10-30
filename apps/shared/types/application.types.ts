/**
 * Application-related types and enums
 * These are shared between frontend and backend
 */

/**
 * Application stages represent the different steps in the application process
 */
export enum ApplicationStage {
  APP_RECEIVED = 'Application Received',
  PM_CHALLENGE = 'PM Challenge',
  B_INTERVIEW = 'Behavioral Interview',
  T_INTERVIEW = 'Technical Interview',
  // Terminal stages that align with the Decision enum
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * Progress status for non-terminal application stages
 */
export enum StageProgress {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

/**
 * Review status relative to a recruiter
 */
export enum ReviewStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  IN_REVIEW = 'IN_REVIEW',
  REVIEW_COMPLETE = 'REVIEW_COMPLETE',
}

/**
 * Available positions for applications
 */
export enum Position {
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

/**
 * Semester options
 */
export enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

/**
 * Final decision for applications
 */
export enum Decision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

/**
 * Application response structure
 */
export interface Response {
  question: string;
  answer: string;
}

/**
 * Review structure
 */
export interface Review {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  reviewerId: number;
  rating: number;
  stage: ApplicationStage;
  content: string;
}

/**
 * Assigned recruiter information
 */
export interface AssignedRecruiter {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  assignedAt?: Date;
}

/**
 * Main Application interface
 */
export interface Application {
  id: number;
  createdAt: Date;
  year: number;
  semester: Semester;
  position: Position;
  stage: ApplicationStage;
  stageProgress: StageProgress;
  reviewStatus: ReviewStatus;
  response: Response[];
  numApps: number;
  reviews: Review[];
  assignedRecruiters: AssignedRecruiter[];
}

/**
 * Application row for table display
 */
export interface ApplicationRow {
  id: number;
  userId: number;
  name: string;
  position: Position;
  reviewed: string;
  assignedTo: AssignedRecruiter[];
  stage: ApplicationStage;
  rating: number | null;
  createdAt: Date;
  meanRatingAllReviews: number | null;
  meanRatingResume: number | null;
  meanRatingChallenge: number | null;
  meanRatingTechnicalChallenge: number | null;
  meanRatingInterview: number | null;
}

/**
 * Backend Application DTO structure for table data
 */
export interface BackendApplicationDTO {
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
