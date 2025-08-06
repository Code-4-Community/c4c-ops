enum ApplicationStage {
  APP_RECEIVED = 'Application Received',
  PM_CHALLENGE = 'PM Challenge',
  B_INTERVIEW = 'Behavioral Interview',
  T_INTERVIEW = 'Technical Interview',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

enum ReviewStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  REVIEWING = 'REVIEWING',
  REVIEWED = 'REVIEWED',
}

enum ApplicationStep {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

enum Position {
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

type ApplicationRow = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  stage: ApplicationStage;
  step: ApplicationStep;
  review: ReviewStatus;
  position: Position;
  createdAt: string;
  meanRatingAllStages: number;
  meanRatingSingleStages: number;
};

type Response = {
  question: string;
  answer: string;
};

type Review = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  reviewerId: number;
  rating: number;
  stage: ApplicationStage;
  content: string;
};

enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

type Application = {
  id: number;
  createdAt: Date;
  year: number;
  semester: Semester;
  position: Position;
  stage: ApplicationStage;
  step: ApplicationStep;
  review: ReviewStatus;
  response: Response[];
  numApps: number;
  reviews: Review[];
};

// TODO: should match backend type
type User = {
  id: number;
  status: string;
};

enum Decision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export {
  User,
  ApplicationRow,
  Application,
  ApplicationStage,
  ApplicationStep,
  ReviewStatus,
  Position,
  Response,
  Review,
  Semester,
  Decision,
};
