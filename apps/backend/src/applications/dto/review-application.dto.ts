import { IsEnum } from 'class-validator';
import { Rating } from '../types';

export class ReviewApplicationDTO {
  reviewerId: number;

  @IsEnum(Rating)
  rating: Rating;

  summary: string;
}
