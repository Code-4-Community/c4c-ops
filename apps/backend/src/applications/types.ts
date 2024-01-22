export type Response = {
  question: string;
  answer: string;
};

export type Review = {
  reviewerId: number;
  rating: Rating;
  summary: string;
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

export enum Rating {
  STRONG_YES = 'STRONG_YES',
  YES = 'YES',
  NEUTRAL = 'NEUTRAL',
  NO = 'NO',
  STRONG = 'STRONG',
}
