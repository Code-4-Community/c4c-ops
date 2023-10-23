export type Response = {
  question: string;
  answer: string;
};

export type Note = {
  userId: number;
  note: string;
};

export enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
