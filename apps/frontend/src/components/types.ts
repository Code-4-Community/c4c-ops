enum ApplicationStage {
  APP_RECEIVED,
  PM_CHALLENGE,
  B_INTERVIEW,
  T_INTERVIEW,
  ACCEPTED,
  REJECTED,
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
  name: string;
  position: Position;
  reviewed: string;
  assignedTo: string[];
  stage: ApplicationStage;
  rating: number | null;
  createdAt: Date;
  meanRatingAllReviews: number | null;
  meanRatingResume: number | null;
  meanRatingChallenge: number | null;
  meanRatingTechnicalChallenge: number | null;
  meanRatingInterview: number | null;
};

type BackendApplicationDTO = {
  userId: number;
  firstName: string;
  lastName: string;
  stage: ApplicationStage;
  step: ApplicationStep;
  review: ReviewStatus;
  position: Position;
  assignedRecruiters: AssignedRecruiter[];
  createdAt: Date;
  meanRatingAllReviews: number | null;
  meanRatingResume: number | null;
  meanRatingChallenge: number | null;
  meanRatingTechnicalChallenge: number | null;
  meanRatingInterview: number | null;
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
  assignedRecruiters: AssignedRecruiter[];
};

// TODO: should match backend type
type User = {
  id: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  linkedin: string | null;
  github: string | null;
  team: string | null;
  role: string[] | null;
};

type AssignedRecruiter = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  assignedAt?: Date;
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
  BackendApplicationDTO,
  Decision,
  AssignedRecruiter,
};
