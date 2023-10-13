import { IsEnum } from 'class-validator';
import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';
import { Response, Note, Semester, ApplicationStatus } from './types';

@Entity()
export class Application {
  @ObjectIdColumn() //change to be like how it is in users
  userId: ObjectId;

  @Column()
  createdAt: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  cycleSemester: Semester;

  @Column()
  cycleYear: number;

  @Column()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column()
  @IsEnum(Response)
  application: Response;

  @Column()
  notes: Note;
}
