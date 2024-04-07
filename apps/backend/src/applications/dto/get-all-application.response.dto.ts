import { IsDate, IsEnum, IsPositive, IsString } from 'class-validator';
import { ApplicationStage, ApplicationStep, Position } from '../types';

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

  @IsPositive()
  meanRatingAllStages: number;

  // TODO: Should be a JSON or similar that defines scores for each stage
  @IsPositive()
  meanRatingSingleStages: number;
}
