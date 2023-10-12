import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';
import { Response, Note, Semester, ApplicationStatus } from './types';

@Entity()
export class Application {
  @ObjectIdColumn() // https://github.com/typeorm/typeorm/issues/1584
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
  status: ApplicationStatus;

  @Column()
  application: Response;

  @Column()
  notes: Note;
}
