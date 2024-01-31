import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import { getAppForCurrentCycle, getCurrentCycle } from './utils';
import { Cycle } from './dto/cycle.dto';
import { User } from '../users/user.entity';
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
   * Submits the application for the given user. Stores the new application in the
   * Application table and updates the user's applications field.
   *
   * @param application holds the user's ID as well as their application responses
   * @param user the user who is submitting the application
   * @throws { BadRequestException } if the user does not exist in our database (i.e., they have not signed up).
   * @returns { User } the updated user
   */

  async submitApp(application: Response[], user: User): Promise<User> {
    const {
      applications: existingApplications,
    }: { applications: Application[] } = user;

    const { year, semester } = getCurrentCycle();

    // TODO Maybe allow for more applications?
    if (getAppForCurrentCycle(existingApplications)) {
      throw new UnauthorizedException(
        `Applicant ${user.userId} has already submitted an application for the current cycle`,
      );
    }

    const newApplication: Application = this.applicationsRepository.create({
      applicantId: user.userId,
      createdAt: new Date(),
      status: ApplicationStatus.SUBMITTED,
      year,
      semester,
      application,
      notes: [],
    });

    await this.applicationsRepository.save(newApplication);
    existingApplications.push(newApplication);

    return await this.usersService.updateUser(
      user,
      { applications: existingApplications },
      user.userId,
    );
  }

  /**
   * Verifies that this endpoint is being called from our Google Forms.
   * Checks that the email was hashed with the correct private key.
   *
   * @param email the email used for submission on Google Forms
   * @param signature the signature corresponding to the hashed email
   * @throws { UnauthorizedException } if the signature does not match the expected signature or the calling user
   * has not created an account with Code4Community
   * @returns { User } the one who submitted the form
   */
  async verifySignature(email: string, signature: string): Promise<User> {
    const SECRET = process.env.NX_GOOGLE_FORM_SECRET_KEY;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(email)
      .digest('base64');

    if (signature === expectedSignature) {
      const users = await this.usersService.find(email);
      const user = users[0];

      // occurs if someone doesn't sign up to our portal before submitting form
      // throws exception if email does not exist
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    }
    // If the caller of this endpoint submits from anywhere other than our google forms
    throw new UnauthorizedException();
  }

  async findOne(currentUser: User, userId: number): Promise<Application> {
    // const currentStatus = currentUser.status;
    // switch (currentStatus) {
    //   case UserStatus.ADMIN:
    //   case UserStatus.RECRUITER:
    //     break;
    //   default:
    //     if (currentUser.userId !== userId) {
    //       throw new UnauthorizedException('User not found');
    //     }
    //     break;
    // }

    const applicant = await this.usersService.findOne(currentUser, userId);
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
