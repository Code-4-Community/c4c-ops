import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Application } from '../applications/application.entity';
import { User } from '../users/user.entity';
import { ApplicationStage } from '@shared/types/application.types';

@Entity()
export class Review {
  @Column({ primary: true, generated: true })
  id: number;

  @Column({ nullable: false })
  createdAt: Date;

  @Column({ nullable: false })
  updatedAt: Date;

  @ManyToOne(() => Application, (app) => app.reviews, { nullable: false })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  // The relationship to User
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  // The foreign key column
  @Column({ nullable: false })
  reviewerId: number;

  @Column({ type: 'double precision', nullable: false })
  rating: number;

  @Column({ type: 'varchar', nullable: false })
  stage: ApplicationStage;

  @Column({ nullable: false })
  content: string;
}
