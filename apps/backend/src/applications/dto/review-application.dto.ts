import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Rating } from '../types';

export class ReviewApplicationDTO {
  @IsNumber()
  reviewerId: number;

  @IsEnum(Rating)
  rating: Rating;

  @IsString()
  summary: string;
}
