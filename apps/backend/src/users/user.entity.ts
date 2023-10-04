import { Entity, Column } from 'typeorm';
import { Status } from './types';

@Entity()
export class User {
  @Column({ primary: true })
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
  profilePicture: string | null;

  @Column()
  linkedin: string | null;

  @Column()
  github: string | null;

  @Column()
  team: string | null;

  @Column()
  role: string | null;
}
