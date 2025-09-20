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
  StageProgress,
  ReviewStatus,
} from '../../../shared/types/application.types';
import {
  GetApplicationResponseDTO,
  AssignedRecruiterDTO,
  GetAllApplicationResponseDTO,
} from '../../../shared/dto/application.dto';
import { Review } from '../reviews/review.entity';
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

  @Column('varchar', {
    default: ApplicationStage.APP_RECEIVED,
    nullable: false,
  })
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @Column('varchar', { default: ReviewStatus.UNASSIGNED, nullable: false })
  @IsEnum(ReviewStatus)
  reviewStatus: ReviewStatus;

  @Column('varchar', { default: StageProgress.PENDING, nullable: false })
  stageProgress: StageProgress;

  @Column('jsonb')
  @IsArray()
  @IsObject({ each: true })
  response: Response[];

  // @Column('varchar', { array: true, default: {} })
  @IsArray()
  @IsObject({ each: true })
  @OneToMany(() => Review, (review) => review.application)
  reviews: Review[];

  @Column('int', { array: true, default: [] })
  @IsArray()
  assignedRecruiterIds: number[];

  toGetAllApplicationResponseDTO(
    meanRatingAllReviews,
    meanRatingResume,
    meanRatingChallenge,
    meanRatingTechnicalChallenge,
    meanRatingInterview,
    stageProgress,
    assignedRecruiters: AssignedRecruiterDTO[] = [],
  ): GetAllApplicationResponseDTO {
    return {
      userId: this.user.id,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      stage: this.stage,
      stageProgress: stageProgress,
      position: this.position,
      reviewStatus: this.reviewStatus,
      createdAt: this.createdAt,
      meanRatingAllReviews,
      meanRatingResume,
      meanRatingChallenge,
      meanRatingTechnicalChallenge,
      meanRatingInterview,
      assignedRecruiters,
    };
  }

  toGetApplicationResponseDTO(
    numApps: number,
    stageProgress: StageProgress,
    assignedRecruiters: AssignedRecruiterDTO[] = [],
  ): GetApplicationResponseDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      year: this.year,
      semester: this.semester,
      position: this.position,
      stage: this.stage,
      stageProgress: stageProgress,
      reviewStatus: this.reviewStatus,
      response: this.response,
      reviews: this.reviews,
      numApps,
      assignedRecruiters,
    };
  }
}
