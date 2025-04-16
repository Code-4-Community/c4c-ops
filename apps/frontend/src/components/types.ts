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

enum UserStatus {
  MEMBER = 'Member',
  RECRUITER = 'Recruiter',
  ADMIN = 'Admin',
  ALUMNI = 'Alumni',
  APPLICANT = 'Applicant',
}

enum Team {
  SFTT = 'Speak for the Trees',
  CONSTELLATION = 'Constellation',
  JPAL = 'J-PAL',
  BREAKTIME = 'Breaktime',
  GI = 'Green Infrastructure',
  CI = 'Core Infrastructure',
  EBOARD = 'E-Board',
}

enum Role {
  DIRECTOR_OF_ENGINEERING = 'Director of Engineering',
  DIRECTOR_OF_PRODUCT = 'Director of Product',
  DIRECTOR_OF_FINANCE = 'Director of Finance',
  DIRECTOR_OF_MARKETING = 'Director of Marketing',
  DIRECTOR_OF_RECRUITMENT = 'Director of Recruitment',
  DIRECTOR_OF_OPERATIONS = 'Director of Operations',
  DIRECTOR_OF_EVENTS = 'Director of Events',
  DIRECTOR_OF_DESIGN = 'Director of Design',
  PRODUCT_MANAGER = 'Product Manager',
  PRODUCT_DESIGNER = 'Product Designer',
  TECH_LEAD = 'Technical Lead',
  DEVELOPER = 'Developer',
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
  assignedRecruiters: User[];
  meanRatingAllStages: number;
  meanRatingSingleStages: number;
  eventsAttended: number;
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
  response: Response[];
  numApps: number;
  reviews: Review[];
  assignedRecruiters: User[];
  eventsAttended: number;
};

type User = {
  id: number;
  status: UserStatus;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  linkedin: string | null;
  github: string | null;
  team: Team | null;
  role: Role[] | null;
  applications: Application[];
  recruiters: User[];
};

export {
  ApplicationRow,
  Application,
  User,
  ApplicationStage,
  ApplicationStep,
  Position,
  UserStatus,
  Team,
  Role,
  Response,
  Review,
  Semester,
};
