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
import {
  Response,
  Semester,
  Position,
  ApplicationStage,
  ApplicationStep,
} from './types';
import { GetApplicationResponseDTO } from './dto/get-application.response.dto';
import { Review } from '../reviews/review.entity';

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

  @Column('varchar', { nullable: false })
  @IsEnum(Position)
  position: Position;

  @Column('varchar', { default: ApplicationStage.RESUME, nullable: false })
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @Column('varchar', { default: ApplicationStep.SUBMITTED, nullable: false })
  step: ApplicationStep;

  @Column('jsonb')
  @IsArray()
  @IsObject({ each: true })
  response: Response[];

  @Column('varchar', { array: true, default: {} })
  @IsArray()
  @IsObject({ each: true })
  reviews: Review[];

  toGetApplicationResponseDTO(numApps: number): GetApplicationResponseDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      year: this.year,
      semester: this.semester,
      position: this.position,
      stage: this.stage,
      step: this.step,
      response: this.response,
      reviews: this.reviews,
      numApps,
    };
  }
}
