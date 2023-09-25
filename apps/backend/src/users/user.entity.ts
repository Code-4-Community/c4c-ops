import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Status } from './types';

@Entity()
export class User {
  @ObjectIdColumn() // https://github.com/typeorm/typeorm/issues/1584
  userId: number;

  @Column()
  status: Status;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  profilePicture: string;

  @Column()
  linkedin: string | null;

  @Column()
  github: string | null;

  @Column()
  team: string | null;

  @Column()
  role: string | null;
}
