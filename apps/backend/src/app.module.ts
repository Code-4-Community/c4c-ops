import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PluralNamingStrategy } from './strategies/plural-naming.strategy';
import { ApplicationsModule } from './applications/applications.module';
import { Application } from './applications/application.entity';
import { FileUpload } from './file-upload/entities/file-upload.entity';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NX_DB_HOST,
      port: 5432,
      username: process.env.NX_DB_USERNAME,
      password: process.env.NX_DB_PASSWORD,
      autoLoadEntities: true,
      database: process.env.NX_DB_DATABASE || 'c4c-ops',
      entities: [Application, FileUpload],
      // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data
      synchronize: true,
      namingStrategy: new PluralNamingStrategy(),
    }),
    TypeOrmModule.forFeature([Application, FileUpload]),
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ReviewsModule,
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
