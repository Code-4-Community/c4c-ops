import { Review } from '../../reviews/review.entity';
import {
  ApplicationStage,
  ApplicationStep,
  Position,
  Response,
  ReviewStatus,
  Semester,
} from '../types';

export class GetApplicationResponseDTO {
  id: number;

  createdAt: Date;

  year: number;

  semester: Semester;

  position: Position;

  stage: ApplicationStage;

  step: ApplicationStep;

  review: ReviewStatus;

  response: Response[];

  reviews: Review[];

  numApps: number;
}
