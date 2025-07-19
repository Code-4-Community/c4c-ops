import { Review } from '../../reviews/review.entity';
import {
  ApplicationStage,
  Position,
  Response,
  ReviewStage,
  Semester,
} from '../types';

export class GetApplicationResponseDTO {
  id: number;

  createdAt: Date;

  year: number;

  semester: Semester;

  position: Position;

  stage: ApplicationStage;

  step: ReviewStage;

  response: Response[];

  reviews: Review[];

  numApps: number;
}
