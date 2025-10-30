/**
 * Review request DTOs
 */

import { ApplicationStage } from '../../types/application.types';

/**
 * Submit review request interface
 */
export interface SubmitReviewRequest {
  applicantId: number;
  stage: ApplicationStage;
  rating: number;
  content: string;
}
