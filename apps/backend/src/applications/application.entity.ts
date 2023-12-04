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
  @Column({ primary: true })
  @IsPositive()
  id: number;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn()
  user: User;

  @Column()
  @IsDateString()
  createdAt: Date;

  @Column()
  @IsPositive()
  @Min(2023)
  year: number;

  @Column('varchar')
  @IsEnum(Semester)
  semester: Semester;

  @Column('varchar')
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column('varchar', { array: true })
  @IsArray()
  @IsObject({ each: true })
  application: Response[];

  @Column('varchar', { array: true })
  @IsArray()
  @IsObject({ each: true })
  notes: Note[];
}
