import { IsArray, IsDate, IsEnum, IsPositive, IsString } from 'class-validator';
import { ApplicationStage, ApplicationStep, Position } from '../types';
import { User } from '../../users/user.entity';

export class GetAllApplicationResponseDTO {
  @IsPositive()
  userId: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsEnum(ApplicationStep)
  step: ApplicationStep;

  @IsEnum(Position)
  position: Position;

  @IsDate()
  createdAt: Date;

  @IsArray()
  recruiters: User[];

  @IsPositive()
  meanRatingAllReviews: number;

  @IsPositive()
  meanRatingResume: number;

  @IsPositive()
  meanRatingChallenge: number;

  @IsPositive()
  meanRatingTechnicalChallenge: number;

  @IsPositive()
  meanRatingInterview: number;

  @IsPositive()
  eventsAttended: number;
}
