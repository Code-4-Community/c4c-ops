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
  IN_REVIEW = 'IN_REVIEW',
  REVIEW_COMPLETE = 'REVIEW_COMPLETE',
}

enum Position {
  TECH_LEAD = 'TECH_LEAD',
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

enum StageProgress {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

// has more fields than applciation/review entity, they are merged
type ApplicationRow = {
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
};

type BackendApplicationDTO = {
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
  FALL = 'Fall',
  SPRING = 'Spring',
}

type Application = {
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
};

// TODO: should match backend type
type User = {
  id: number;
  // TODO: Maybe make UserStatus enum that matches backend
  status: string | null;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  linkedin: string | null;
  github: string | null;
  // team: Team | null;
  role: Position[] | null;
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
  StageProgress,
  ReviewStatus,
  Position,
  Response,
  Review,
  Semester,
  BackendApplicationDTO,
  Decision,
  AssignedRecruiter,
};
