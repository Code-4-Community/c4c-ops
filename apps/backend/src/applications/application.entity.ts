import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsPositive,
} from 'class-validator';
import { Entity, Column } from 'typeorm';
import { Response, ApplicationStatus, Review } from './types';
import { Cycle } from './dto/cycle.dto';

@Entity()
export class Application {
  @Column({ primary: true })
  @IsPositive()
  id: number;

  @Column()
  @IsDateString()
  createdAt: Date;

  @Column()
  @IsObject()
  cycle: Cycle;

  @Column()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Column()
  @IsArray()
  @IsObject({ each: true })
  application: Response[];

  @Column()
  @IsArray()
  @IsObject({ each: true })
  reviews: Review[];
}
