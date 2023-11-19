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
import { plainToClass } from 'class-transformer';
import { User } from '../users/user.entity';
import { SubmitApplicationDto } from './dto/submit-app.dto';
import { ObjectId } from 'mongodb';
import { ApplicationStatus } from './types';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: MongoRepository<Application>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Supmits the applicant users' responses
   *
   * @param application holds the applicant's ID as well as their application responses
   *
   *
   * @throws {BadRequestException} if calling user does not exist
   * @throws {UnauthorizedException} if calling user does not have proper permissions
   */

  async submitApp(application: SubmitApplicationDto) {
    //TODO add callingUser as a parameter

    const { applicantId, application: responses } = application;

    const callingUser: User = {
      _id: new ObjectId(),
      userId: 99,
      status: UserStatus.ADMIN,
      firstName: 'SomeUser',
      lastName: 'UserSome',
      email: 'someEmail@google.com',
      applications: [],
      linkedin: null,
      profilePicture: null,
      github: null,
      team: null,
      role: null,
    };

    //throws 400 bad request exception if applicantId does not exist
    const applicantUser = await this.usersService.findOne(
      callingUser,
      applicantId,
    );

    const {
      applications: existingApplications,
    }: { applications: Application[] } = applicantUser;

    //TODO Maybe allow for more applications?
    if (getAppForCurrentCycle(existingApplications)) {
      throw new UnauthorizedException(
        `Applicant ${applicantId} has already submitted an application for the current cycle`,
      );
    }

    //create a new application given the new responses then add it to existing applications
    const newApplication: Application = {
      id: applicantId,
      createdAt: new Date(),
      cycle: getCurrentCycle(),
      status: ApplicationStatus.SUBMITTED,
      application: responses,

      //TODO should notes always be null when submitted?
      notes: null,
    };

    existingApplications.push(newApplication);

    await this.usersService.updateUser(
      callingUser,
      { applications: existingApplications },
      applicantId,
    );

    //should we return the updated user from usersService.updateUser()?
    //TODO update google forms appscript
  }

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

    const cycle = plainToClass(Cycle, currentApp.cycle);

    //the user with the given userId has not applied in the current recruitment cycle
    if (!cycle.isCurrentCycle(getCurrentCycle())) {
      throw new BadRequestException(
        "Applicant hasn't applied in the current cycle",
      );
    }

    return currentApp;
  }
}
