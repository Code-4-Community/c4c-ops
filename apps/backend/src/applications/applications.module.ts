import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
})
export class UsersModule {}
