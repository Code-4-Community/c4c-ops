import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { Application } from '../applications/application.entity';
import { ApplicationsService } from '../applications/applications.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // TypeORM setup for managing database storage
    TypeOrmModule.forFeature([FileUpload, Application, User]),
    UsersModule,
  ],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    UsersService,
    AuthService,
    JwtStrategy,
    CurrentUserInterceptor,
    ApplicationsService,
  ],
  exports: [TypeOrmModule],
})
export class FileUploadModule {}
