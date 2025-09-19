export type Response = {
  question: string;
  answer: string;
};

export enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

// each non-terminal ApplicationStage associated with StageProgress
export enum StageProgress {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum ApplicationStage {
  APP_RECEIVED = 'Application Received',
  PM_CHALLENGE = 'PM Challenge',
  B_INTERVIEW = 'Behavioral Interview',
  T_INTERVIEW = 'Technical Interview',
  // these below are terminal stages that align with the Decision enum
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

// status of the review process for an application
// relative to a recruiter
export enum ReviewStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  IN_REVIEW = 'IN_REVIEW',
  REVIEW_COMPLETE = 'REVIEW_COMPLETE',
}

export enum Position {
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

export enum Decision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}
