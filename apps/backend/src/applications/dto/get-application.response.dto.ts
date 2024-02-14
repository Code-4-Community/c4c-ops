import { Review } from '../../reviews/review.entity';
import {
  ApplicationStage,
  ApplicationStep,
  Position,
  Response,
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

  response: Response[];

  reviews: Review[];

  numApps: number;
}
