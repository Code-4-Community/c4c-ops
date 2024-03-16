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
import { Response } from './types';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { Position, ApplicationStage, ApplicationStep } from './types';
import { GetApplicationResponseDTO } from './dto/get-application.response.dto';
import { Cycle } from './dto/cycle';

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

  async findAll(userId: number): Promise<Application[]> {
    const apps = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return apps;
  }

  async findAllCurrentApplications(): Promise<GetApplicationResponseDTO[]> {
    const currentCycle: Cycle = getCurrentCycle();
    const applications = await this.applicationsRepository.find({
      where: {
        //TODO q: I had to change Cycle definition to make year and semester public. Is there a reason it was private?
        year: currentCycle.year,
        semester: currentCycle.semester,
      },
    });

    const dtos: GetApplicationResponseDTO[] = [];

    applications.forEach((app) =>
      //TODO q: what is the numApps parameter? I just passed 0 in
      dtos.push(app.toGetApplicationResponseDTO(0)),
    );

    return dtos;
  }

  async fake() {
    const allApps = await this.applicationsRepository.find({
      relations: {
        user: true,
      },
    });
    const fakeApps = [];
    allApps.forEach((app) => {
      const email = app.user.email;
      const fullName = app.user.firstName + ' ' + app.user.lastName;
      const createdAt = app.createdAt;
      // const year = app.year
      // const semester = app.semester
      const position = app.position;
      const stage = app.stage;
      // const step = app.step
      // const response = app.response
      // const reviews = app.reviews
      const numApps = 0;
      fakeApps.push({ email, fullName, createdAt, position, stage, numApps });
    });

    return fakeApps;
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
