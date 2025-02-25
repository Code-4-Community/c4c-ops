import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './application.entity';
import { User } from '../users/user.entity';
import { FileUpload } from '../file-upload/entities/file-upload.entity';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User, FileUpload])],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    UsersService,
    AuthService,
    JwtStrategy,
    CurrentUserInterceptor,
  ],
})
export class ApplicationsModule {}
