import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';
import { Response, Note } from './types';

@Entity()
export class Application {
  @ObjectIdColumn() // https://github.com/typeorm/typeorm/issues/1584
  userId: ObjectId;

  @Column()
  Response: Response;

  @Column()
  Note: Note;
}
