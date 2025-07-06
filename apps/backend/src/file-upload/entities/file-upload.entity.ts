import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Application } from '../../applications/application.entity';

export enum FileType {
  OVERVIEW = 'overview',
  APPLICATION = 'application',
  MATERIALS = 'materials',
  INTERVIEW_NOTES = 'interview_notes',
}

@Entity()
export class FileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({ type: 'bytea' }) // For PostgreSQL binary data
  file_data: Buffer;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.MATERIALS,
  })
  file_type: FileType;

  @ManyToOne(() => Application, (application) => application.attachments, {
    onDelete: 'CASCADE',
  })
  application: Application;
}
