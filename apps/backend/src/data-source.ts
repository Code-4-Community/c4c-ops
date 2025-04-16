import { DataSource } from 'typeorm';
import { Application } from './applications/application.entity';
import { FileUpload } from './file-upload/entities/file-upload.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NX_DB_HOST,
  port: 5432,
  username: process.env.NX_DB_USERNAME,
  password: process.env.NX_DB_PASSWORD,
  database: process.env.NX_DB_DATABASE || 'c4c-ops',
  entities: [Application, FileUpload],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'custom_migration_table',
});
