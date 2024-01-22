import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Rating, Review } from '../types';

export class ReviewApplicationDTO {
  @IsNumber()
  reviewerId: number;

  @IsEnum(Rating)
  rating: Rating;

  @IsString()
  summary: string;

  toReview(): Review {
    return {
      reviewerId: this.reviewerId,
      rating: this.rating,
      summary: this.summary,
    };
  }
}
