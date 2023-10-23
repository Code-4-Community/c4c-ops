import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './application.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User])],
  providers: [ApplicationsService, UsersService],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
