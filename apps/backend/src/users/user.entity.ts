import { Entity, Column } from 'typeorm';
import { Status, Role, Team } from './types';

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
  team: Team | null;

  @Column()
  role: Role[] | null;
}
