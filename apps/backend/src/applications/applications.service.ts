import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MongoRepository } from 'typeorm';
import { Status } from '../users/types';

import { Application } from './application.entity';
import { Response, Note } from './types';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: MongoRepository<Application>,
  ) {}

  async findOne(userId: number) {
    const application = await this.applicationsRepository.findOneBy({
      id: userId,
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    //both of these methods haven't been merged yet
    // const currentUser = getCurrentUser();
    // const applicationUser = getUser(userId);

    //const currentStatus = currentUser.status;
    // switch (currentStatus) {
    //   case Status.ADMIN:
    //   case Status.RECRUITER:
    //     break;
    //   default:
    //     if (currentUser.userId !== applicationUser.userId) {
    //       throw new BadRequestException('User not found');
    //     }
    //     break;
    // }

    return application;
  }
}
