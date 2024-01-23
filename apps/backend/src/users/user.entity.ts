import {
  IsArray,
  IsEmail,
  IsEnum,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Entity, Column, OneToMany } from 'typeorm';
import { Application } from '../applications/application.entity';
import { Role, Team, UserStatus } from './types';
import { GetUserResponseDto } from './dto/get-user.response.dto';

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

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  toGetUserResponseDto(): GetUserResponseDto {
    return {
      id: this.id,
      status: this.status,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      profilePicture: this.profilePicture,
      linkedin: this.linkedin,
      github: this.github,
      team: this.team,
      role: this.role,
    };
  }
}
