export type Response = {
  question: string;
  answer: string;
};

export enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

export enum ApplicationStage {
  RESUME = 'RESUME',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',

  // Devs only
  TECHNICAL_CHALLENGE = 'TECHNICAL_CHALLENGE',
  // PMs only
  PM_CHALLENGE = 'PM_CHALLENGE',
}

export enum ApplicationStep {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
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
