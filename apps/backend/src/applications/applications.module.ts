import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './application.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User])],
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
