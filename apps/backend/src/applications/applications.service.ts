import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MongoRepository } from 'typeorm';
import { Status } from '../users/types';
import { UsersService } from '../users/users.service';
import { getCurrentUser } from '../users/utils';

import { Application } from './application.entity';
import { getCurrentCycle } from './utils';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: MongoRepository<Application>,
    private readonly usersService: UsersService,
  ) {}

  async findOne(userId: number) {
    const currentUser = getCurrentUser();
    const currentCycle = getCurrentCycle();

    const application = await this.applicationsRepository.findOneBy({ userId });

    //the given userId is not associated with a user
    //(double check if this works- seems like this may check if this user has an application instead)
    if (!application) {
      throw new BadRequestException('Application not found');
    }

    //the user with the given userId has not applied in the current recruitment cycle
    if (application.semester !== currentCycle) {
      throw new BadRequestException('Application not found');
    }

    const applicant = await this.usersService.findOne(userId);

    const currentStatus = currentUser.status;
    switch (currentStatus) {
      case Status.ADMIN:
      case Status.RECRUITER:
        break;
      default:
        if (currentUser.userId !== applicant.userId) {
          throw new BadRequestException('User not found');
        }
        break;
    }

    return application;
  }
}
