import { IsEnum } from 'class-validator';
import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';
import { Response, Note, Semester, ApplicationStatus } from './types';

@Entity()
export class Application {
  @Column()
  createdAt: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  semester: Semester;

  @Column()
  year: number;

  @Column()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column()
  application: Response[];

  @Column()
  notes: Note[];
}
