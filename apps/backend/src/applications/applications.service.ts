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
import { ApplicationStatus, Response } from './types';
import * as crypto from 'crypto';

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

  async submitApp(application: Response[], user: User) {
    //TODO add callingUser as a parameter

    user.status = UserStatus.ADMIN;

    const {
      applications: existingApplications,
    }: { applications: Application[] } = user;

    //TODO Maybe allow for more applications?
    if (getAppForCurrentCycle(existingApplications)) {
      throw new UnauthorizedException(
        `Applicant ${user.userId} has already submitted an application for the current cycle`,
      );
    }

    //create a new application given the new responses then add it to existing applications
    const newApplication: Application = {
      id: user.userId,
      createdAt: new Date(),
      cycle: getCurrentCycle(),
      status: ApplicationStatus.SUBMITTED,
      application,

      //TODO should notes always be null when submitted?
      notes: null,
    };

    existingApplications.push(newApplication);

    await this.usersService.updateUser(
      user,
      { applications: existingApplications },
      user.userId,
    );

    //should we return the updated user from usersService.updateUser()?
    //TODO update google forms appscript
  }

  async verifySignature(email: string, signature: string): Promise<User> {
    //temporary secret
    const SECRET =
      'e637efc085ab91eb6b5740fa56a4d366c9a6e63db369319ef414e7c200fd6bca';
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(email)
      .digest('base64');

    if (signature === expectedSignature) {
      const users = await this.usersService.find(email);
      const user = users[0];
      console.log(users, user);

      // occurs if someone doesn't sign up to our portal before submitting form
      // throws exception if email does not exist
      if (!user) {
        console.log(user);
        throw new UnauthorizedException('verifySignature 1');
      }
      console.log(user);
      return user;
    }

    throw new UnauthorizedException('verifysignature 2');
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
