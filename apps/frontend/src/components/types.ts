enum ApplicationStage {
  RESUME = 'RESUME',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  TECHNICAL_CHALLENGE = 'TECHNICAL_CHALLENGE',
  PM_CHALLENGE = 'PM_CHALLENGE',
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

type ApplicationRow = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  stage: ApplicationStage;
  step: ApplicationStep;
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
  reviewerName: string;
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
  response: Response[];
  numApps: number;
  reviews: Review[];
};

export {
  ApplicationRow,
  Application,
  ApplicationStage,
  ApplicationStep,
  Position,
  Response,
  Review,
  Semester,
  User,
  AssignedRecruiter,
  Decision,
};
