export type Response = {
  question: string;
  answer: string;
};

export type Note = {
  userId: number;
  note: string;
};

//should I make these uppercase?
export enum Semester {
  Fall = 'Fall',
  Spring = 'Spring',
}

export enum ApplicationStatus {
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}
