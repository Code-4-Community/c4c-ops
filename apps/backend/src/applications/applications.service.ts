import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UserStatus } from '../users/types';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import { getAppForCurrentCycle, getCurrentCycle } from './utils';
import { Cycle } from './dto/cycle.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: MongoRepository<Application>,
    private readonly usersService: UsersService,
  ) {}

  async findOne(currentUser: User, userId: number): Promise<Application> {
    const currentStatus = currentUser.status;
    switch (currentStatus) {
      case UserStatus.ADMIN:
      case UserStatus.RECRUITER:
        break;
      default:
        if (currentUser.userId !== userId) {
          throw new UnauthorizedException('User not found');
        }
        break;
    }

    const applicant = await this.usersService.findOne(currentUser, userId);
    console.log(applicant);
    const currentApp = getAppForCurrentCycle(applicant.applications ?? []);
    if (currentApp == null) {
      throw new BadRequestException('Application not found');
    }

    const cycle = new Cycle(currentApp.year, currentApp.semester);

    //the user with the given userId has not applied in the current recruitment cycle
    if (!cycle.isCurrentCycle(getCurrentCycle())) {
      throw new BadRequestException(
        "Applicant hasn't applied in the current cycle",
      );
    }

    return currentApp;
  }
}
