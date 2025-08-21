import { IsNumber, IsString } from 'class-validator';

export class UpdateReviewRequestDTO {
  @IsNumber()
  rating: number;

  @IsString()
  content: string;

  @IsString()
  stage: string;
}
