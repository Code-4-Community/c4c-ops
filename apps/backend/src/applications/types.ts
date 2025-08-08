export type Response = {
  question: string;
  answer: string;
};

export enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

export enum ApplicationStep {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

export enum ApplicationStage {
  APP_RECEIVED = 'Application Received',
  PM_CHALLENGE = 'PM Challenge',
  B_INTERVIEW = 'Behavioral Interview',
  T_INTERVIEW = 'Technical Interview',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export const ApplicationStageOrder: ApplicationStage[] = [
  ApplicationStage.APP_RECEIVED,
  ApplicationStage.PM_CHALLENGE,
  ApplicationStage.B_INTERVIEW,
  ApplicationStage.T_INTERVIEW,
  ApplicationStage.ACCEPTED,
  ApplicationStage.REJECTED,
];

export enum ReviewStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  REVIEWING = 'REVIEWING',
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
