import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsPositive,
} from 'class-validator';
import { Column } from 'typeorm';
import { ApplicationStatus, Note, Semester } from '../types';

export class ApplicationDTO {
  @Column({ primary: true })
  @IsPositive()
  id: number;

  @Column()
  @IsDateString()
  createdAt: Date;

  @Column()
  @IsPositive()
  year: number;

  @Column('varchar')
  semester: Semester;

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
