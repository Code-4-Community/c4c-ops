import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsPositive,
  Min,
} from 'class-validator';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Response, Note, ApplicationStatus, Semester } from './types';

@Entity()
export class Application {
  @Column({ primary: true, generated: true })
  @IsPositive()
  id: number;

  @ManyToOne(() => User, (user) => user.applications, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ nullable: false })
  @IsDateString()
  createdAt: Date;

  @Column({ nullable: false })
  @IsPositive()
  @Min(2023)
  year: number;

  @Column('varchar', { nullable: false })
  @IsEnum(Semester)
  semester: Semester;

  @Column('varchar', { default: ApplicationStatus.SUBMITTED })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column('varchar', { array: true, default: {} })
  @IsArray()
  @IsObject({ each: true })
  application: Response[];

  @Column('varchar', { array: true, default: {} })
  @IsArray()
  @IsObject({ each: true })
  notes: Note[];
}
