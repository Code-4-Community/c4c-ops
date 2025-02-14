// describes what a user object consists of

import {
  IsArray,
  IsEmail,
  IsEnum,
  IsPositive,
  IsString,
  IsUrl,
  IsObject,
} from 'class-validator';
import { Entity, Column, OneToMany } from 'typeorm';
import { Application } from '../applications/application.entity';
import { Role, Team, UserStatus } from './types';

@Entity()
export class User {
  @Column({ primary: true, generated: true })
  @IsPositive()
  id: number;

  @Column('varchar')
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column()
  @IsString()
  firstName: string;

  @Column()
  @IsString()
  lastName: string;

  @Column()
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  profilePicture: string | null;

  @Column({ nullable: true })
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['www.linkedin.com'],
  })
  linkedin: string | null;

  @Column({ nullable: true })
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['github.com'],
  })
  github: string | null;

  @Column('varchar', { nullable: true })
  @IsEnum(Team)
  team: Team | null;

  @Column('varchar', { array: true, nullable: true })
  @IsArray()
  @IsEnum(Role, { each: true })
  role: Role[] | null;

  // TODO remove { nullable: true }
  @Column('jsonb', { nullable: true, default: [] })
  @IsArray()
  @IsObject({ each: true })
  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}
