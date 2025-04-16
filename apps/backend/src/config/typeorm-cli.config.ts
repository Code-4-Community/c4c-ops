import { DataSource } from 'typeorm';
import { Application } from '../applications/application.entity';
import { ApplicationsRefactoring1743956381802 } from '../migrations/1743956381802-applications-refactoring';
import { PluralNamingStrategy } from '../strategies/plural-naming.strategy';

// TODO: Run migrations for entities
export default new DataSource({
  type: 'postgres',
  host: process.env.NX_DB_HOST,
  port: 5432,
  username: process.env.NX_DB_USERNAME,
  password: process.env.NX_DB_PASSWORD,
  database: process.env.NX_DB_DATABASE || 'c4c-ops',
  namingStrategy: new PluralNamingStrategy(),
  entities: [Application],
  migrations: [ApplicationsRefactoring1743956381802],
});
