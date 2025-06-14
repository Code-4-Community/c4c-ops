import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsPositive,
  Min,
} from 'class-validator';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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
import { GetAllApplicationResponseDTO } from './dto/get-all-application.response.dto';
import { FileUpload } from '../file-upload/entities/file-upload.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  @IsPositive()
  id: number;

  @Column({ nullable: true })
  content: string;

  @OneToMany(() => FileUpload, (file) => file.application)
  attachments: FileUpload[];

  @ManyToOne(() => User, (user) => user.applications, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
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

  // @Column('varchar', { array: true, default: {} })
  @IsArray()
  @IsObject({ each: true })
  @OneToMany(() => Review, (review) => review.application)
  reviews: Review[];

  toGetAllApplicationResponseDTO(
    meanRatingAllReviews,
    meanRatingResume,
    meanRatingChallenge,
    meanRatingTechnicalChallenge,
    meanRatingInterview,
    applicationStep,
  ): GetAllApplicationResponseDTO {
    return {
      userId: this.user.id,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      stage: this.stage,
      step: applicationStep,
      position: this.position,
      createdAt: this.createdAt,
      meanRatingAllReviews,
      meanRatingResume,
      meanRatingChallenge,
      meanRatingTechnicalChallenge,
      meanRatingInterview,
    };
  }

  toGetApplicationResponseDTO(
    numApps: number,
    applicationStep,
  ): GetApplicationResponseDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      year: this.year,
      semester: this.semester,
      position: this.position,
      stage: this.stage,
      step: applicationStep,
      response: this.response,
      reviews: this.reviews,
      numApps,
    };
  }
}
