import { IsEmail, IsUrl } from 'class-validator';
import { Entity, Column } from 'typeorm';
import { Role, Status, Team } from './types';

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
  @IsEmail()
  email: string;

  @Column()
  profilePicture: string | null;

  @Column()
  @IsUrl()
  linkedin: string | null;

  @Column()
  github: string | null;

  @Column()
  team: Team | null;

  @Column()
  role: Role[] | null;
}
