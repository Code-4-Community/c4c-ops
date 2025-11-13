import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Application } from '../../applications/application.entity';
import { FilePurpose } from '@shared/types/file-upload.types';

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

  @Column({ type: 'enum', enum: FilePurpose })
  purpose: FilePurpose;

  @ManyToOne(() => Application, (application) => application.attachments, {
    onDelete: 'CASCADE',
  })
  application: Application;
}
