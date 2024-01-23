import { ApplicationStatus, Response, Review, Semester } from '../types';

export class GetApplicationResponseDTO {
  id: number;

  createdAt: Date;

  year: number;

  semester: Semester;

  status: ApplicationStatus;

  response: Response[];

  reviews: Review[];

  numApps: number;
}
