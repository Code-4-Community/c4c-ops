import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import { getAppForCurrentCycle, getCurrentCycle } from './utils';
import { Decision, Response } from './types';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { Position, ApplicationStage, ApplicationStep } from './types';
import { stagesMap } from './applications.constants';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: MongoRepository<Application>,
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
  async submitApp(application: Response[], user: User): Promise<Application> {
    const { applications: existingApplications } = user;
    const { year, semester } = getCurrentCycle();

    // TODO Maybe allow for more applications?
    if (getAppForCurrentCycle(existingApplications)) {
      throw new UnauthorizedException(
        `Applicant ${user.id} has already submitted an application for the current cycle`,
      );
    }

    const newApplication: Application = this.applicationsRepository.create({
      user,
      createdAt: new Date(),
      year,
      semester,
      position: Position.DEVELOPER, // TODO: Change this to be dynamic
      stage: ApplicationStage.RESUME,
      step: ApplicationStep.SUBMITTED,
      response: application,
      reviews: [],
    });

    return await this.applicationsRepository.save(newApplication);
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
      const users = await this.usersService.findByEmail(email);
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

  /**
   * Updates the application stage of the applicant.
   * Moves the stage to either the next stage or to rejected.
   *
   * @param applicantId the id of the applicant.
   * @param decision enum that contains either the applicant was 'ACCEPT' or 'REJECT'
   * @returns { void } only updates the stage of the applicant.
   */
  async processDecision(
    applicantId: number,
    decision: Decision,
  ): Promise<void> {
    const application = await this.findCurrent(applicantId);

    let newStage: ApplicationStage;
    if (decision === Decision.REJECT) {
      newStage = ApplicationStage.REJECTED;
    } else {
      const stagesArr = stagesMap[application.position];
      const stageIndex = stagesArr.indexOf(application.stage);
      if (stageIndex === -1) {
        return;
      }
      newStage = stagesArr[stageIndex + 1];
    }
    application.stage = newStage;

    //Save the updated stage
    await this.applicationsRepository.save(application);
  }

  async findAll(userId: number): Promise<Application[]> {
    const apps = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return apps;
  }

  async findCurrent(userId: number): Promise<Application> {
    const apps = await this.findAll(userId);
    const currentApp = getAppForCurrentCycle(apps);

    if (currentApp == null) {
      throw new BadRequestException(
        "Applicant hasn't applied in the current cycle",
      );
    }

    return currentApp;
  }
}
