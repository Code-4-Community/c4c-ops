import { IsPositive, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignedRecruiter } from '@shared/types/application.types';

/**
 * Assigned recruiter DTO
 */
export class AssignedRecruiterDTO implements AssignedRecruiter {
  @IsPositive()
  id: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  assignedAt?: Date;
}
