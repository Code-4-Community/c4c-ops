import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Status, Role, Team } from './types';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  status: Status;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  profilePicture: string | null;

  @Column()
  linkedin: string | null;

  @Column()
  github: string | null;

  @Column()
  team: Team | null;

  @Column()
  role: Role[] | null;
}
