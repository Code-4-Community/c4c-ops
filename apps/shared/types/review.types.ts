/**
 * Review-related types
 * These are shared between frontend and backend
 */

import { ApplicationStage } from './application.types';

/**
 * Review entity interface
 */
export interface Review {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  reviewerId: number;
  applicationId: number;
  rating: number;
  stage: ApplicationStage;
  content: string;
}
