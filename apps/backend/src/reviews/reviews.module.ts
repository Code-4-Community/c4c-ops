import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { User } from '../users/user.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { ApplicationsService } from '../applications/applications.service';
import { Application } from '../applications/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Application, User])],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    ApplicationsService,
    JwtStrategy,
    CurrentUserInterceptor,
    AuthService,
    UsersService,
  ],
})
export class ReviewsModule {}
