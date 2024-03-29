import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Application } from '../applications/application.entity';
import { ApplicationStage } from '../applications/types';

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

  // TODO should be a many-to-many on Users
  @Column({ nullable: false })
  reviewerId: number;

  @Column({ nullable: false })
  rating: number;

  @Column({ type: 'varchar', nullable: false })
  stage: ApplicationStage;

  @Column({ nullable: false })
  content: string;
}
