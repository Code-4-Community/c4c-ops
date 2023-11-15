import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsPositive,
} from 'class-validator';
import { Column } from 'typeorm';
import { ApplicationStatus, Note } from '../types';
import { Cycle } from './cycle.dto';

export class ApplicationDTO {
  @Column({ primary: true })
  @IsPositive()
  id: number;

  @Column()
  @IsDateString()
  createdAt: Date;

  @Column()
  @IsObject()
  cycle: Cycle;

  @Column()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column()
  @IsArray()
  @IsObject({ each: true })
  application: Response[];

  @Column()
  @IsArray()
  @IsObject({ each: true })
  notes: Note[];

  @Column()
  @IsPositive()
  numApps: number;
}
