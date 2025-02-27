import { User } from '../../users/user.entity';
import { Application } from '../application.entity';
import {
  Semester,
  Position,
  ApplicationStage,
  ApplicationStep,
} from '../types';
import { Review } from '../../reviews/review.entity';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class UpdateApplicationRequestDTO {
  @IsOptional()
  @IsEnum(Semester)
  semester?: Semester;

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsOptional()
  @IsEnum(ApplicationStep)
  step: ApplicationStep;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  reviews: Review[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  recruiters: User[];

  @IsOptional()
  @IsPositive()
  numApps: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  eventsAttended: number;
}
