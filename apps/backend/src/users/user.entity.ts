import {
  IsArray,
  IsEmail,
  IsEnum,
  IsObject,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';
import { Application } from '../applications/application.entity';
import { Role, Team, UserStatus } from './types';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ primary: true })
  @IsPositive()
  userId: number;

  @Column()
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

  @Column()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  profilePicture: string | null;

  @Column()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['www.linkedin.com'],
  })
  linkedin: string | null;

  @Column()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['github.com'],
  })
  github: string | null;

  @Column()
  @IsEnum(Team)
  team: Team | null;

  @Column()
  @IsArray()
  @IsEnum(Role, { each: true })
  role: Role[] | null;

  @Column()
  @IsArray()
  @IsObject({ each: true })
  applications: Application[];
}
