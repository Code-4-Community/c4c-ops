import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import {
  getAppForCurrentCycle,
  getCurrentCycle,
  getCurrentSemester,
  getCurrentYear,
} from './utils';
import { Decision, Response, ReviewStatus } from './types';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { UserStatus } from '../users/types';
import { Position, ApplicationStage, ReviewStage, Semester } from './types';
import { GetAllApplicationResponseDTO } from './dto/get-all-application.response.dto';
import { AssignedRecruiterDTO } from './dto/get-application.response.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
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
      stage: ApplicationStage.APP_RECEIVED,
      step: ReviewStage.SUBMITTED,
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
   * Assigns recruiters to an application.
   * Updates the assignedRecruiterIds field on the application.
   *
   * TODO: Currently has ability to unassign recruiters by not including them in the recruiterIds array
   *
   * @param applicationId the id of the application.
   * @param recruiterIds array of recruiter user IDs to assign.
   * @param currentUser the user performing the assignment (must be admin).
   * @returns { void } only updates the assignedRecruiterIds field.
   */
  async assignRecruitersToApplication(
    applicationId: number,
    recruiterIds: number[],
    currentUser: User,
  ): Promise<void> {
    // Verify user is admin
    if (currentUser.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException(
        'Only admins can assign recruiters to applications',
      );
    }

    const recruiters: User[] = await this.findRecruitersByIds(applicationId);

    // Verify all users are recruiters
    for (const recruiter of recruiters) {
      if (recruiter.status !== UserStatus.RECRUITER) {
        throw new BadRequestException(
          `User ${recruiter.id} is not a recruiter`,
        );
      }
    }

    const application: Application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new BadRequestException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Update the assignedRecruiterIds field
    application.assignedRecruiterIds = recruiterIds;
    await this.applicationsRepository.save(application);
  }

  /**
   * Gets assigned recruiters for an application.
   *
   * @param applicationId the id of the application.
   * @param currentUser the user requesting the information.
   * @returns { AssignedRecruiterDTO[] } list of assigned recruiters.
   */
  async getAssignedRecruiters(
    applicationId: number,
    currentUser: User,
  ): Promise<AssignedRecruiterDTO[]> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new BadRequestException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Check permissions based on user role, only show if admin or recruiter
    if (
      currentUser.status !== UserStatus.ADMIN &&
      currentUser.status !== UserStatus.RECRUITER
    ) {
      return [];
    }

    // Get recruiter details
    if (application.assignedRecruiterIds.length === 0) {
      return [];
    }

    const recruiters: User[] = await this.findRecruitersByIds(application.id);

    return recruiters.map((recruiter) => ({
      id: recruiter.id,
      firstName: recruiter.firstName,
      lastName: recruiter.lastName,
      // TODO: currently showing email (for future communication), delete if not necessary
      email: recruiter.email,
    }));
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
    }
    // else {
    // const stagesArr = stagesMap[application.position];
    // const stageIndex = stagesArr.indexOf(application.stage);
    // if (stageIndex === -1) {
    //   return;
    // }
    // newStage = stagesArr[stageIndex + 1];
    // }
    application.stage = newStage;

    //Save the updated stage
    await this.applicationsRepository.save(application);
  }

  /**
   * Updates the Review Stage of a user
   */
  async updateReviewStage(
    userId: number,
    newReviewStage: ReviewStatus,
  ): Promise<Application> {
    const updateResult = await this.applicationsRepository
      .createQueryBuilder()
      .update(Application)
      .set({ review: newReviewStage })
      .where('user.id = :userId', { userId })
      .execute();

    if (updateResult.affected === 0) {
      throw new BadRequestException(`Application for User ${userId} not found`);
    }

    const application = await this.applicationsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'reviews'],
    });

    return application;
  }

  /**
   * Updates the stage of the application for a given user.
   */
  async updateStage(
    userId: number,
    newStage: ApplicationStage,
  ): Promise<Application> {
    const updateResult = await this.applicationsRepository
      .createQueryBuilder()
      .update(Application)
      .set({ stage: newStage })
      .where('user.id = :userId', { userId })
      .execute();

    if (updateResult.affected === 0) {
      throw new BadRequestException(`Application for user ${userId} not found`);
    }

    const application = await this.applicationsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'reviews'],
    });

    return application;
  }

  async findAll(userId: number): Promise<Application[]> {
    const apps = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'reviews'],
    });
    return apps;
  }

  /**
   * Finds the recruiters assigned to an application.
   *
   * @param applicationId the id of the application.
   * @returns { User[] } list of recruiters.
   */
  async findRecruitersByIds(applicationId: number): Promise<User[]> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new BadRequestException(
        `Application with ID ${applicationId} not found`,
      );
    }

    const recruiterIds: number[] = application.assignedRecruiterIds;

    const recruiters: User[] = [];

    for (const recruiterId of recruiterIds) {
      const recruiter = await this.usersService.findUserById(recruiterId);
      if (recruiter.status !== UserStatus.RECRUITER) {
        throw new BadRequestException(`User ${recruiterId} is not a recruiter`);
      }

      recruiters.push(recruiter);
    }

    return recruiters;
  }

  async findAllCurrentApplications(
    currentUser?: User,
  ): Promise<GetAllApplicationResponseDTO[]> {
    const year = getCurrentYear();
    const semester = getCurrentSemester();

    let applications: Application[];

    if (currentUser?.status === UserStatus.RECRUITER) {
      const recruiterId = Number(currentUser.id);

      applications = await this.applicationsRepository
        .createQueryBuilder('application')
        .leftJoinAndSelect('application.user', 'user')
        .leftJoinAndSelect('application.reviews', 'reviews')
        .where(':rid = ANY(application.assignedRecruiterIds)', {
          rid: recruiterId,
        })
        .andWhere('application.year = :year', { year })
        .andWhere('application.semester = :semester', { semester })
        .getMany();
    } else {
      applications = await this.applicationsRepository.find({
        where: { year, semester },
        relations: ['user', 'reviews'],
      });
    }

    const allApplicationsDto = await Promise.all(
      applications.map(async (app) => {
        const ratings = this.calculateAllRatings(app.reviews);
        const reviewStage = this.determineReviewStage(app.reviews);
        const assignedRecruiters =
          await this.getAssignedRecruitersForApplication(app);

        return app.toGetAllApplicationResponseDTO(
          ratings.meanRatingAllReviews,
          ratings.meanRatingResume,
          ratings.meanRatingChallenge,
          ratings.meanRatingTechnicalChallenge,
          ratings.meanRatingInterview,
          reviewStage,
          assignedRecruiters,
        );
      }),
    );

    return allApplicationsDto;
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

  async findOne(applicationId: number): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['user', 'reviews'],
    });

    if (!application) {
      throw new BadRequestException(
        `Application with ID ${applicationId} not found`,
      );
    }

    return application;
  }

  /**
   * Calculates mean rating for reviews filtered by stage
   */
  private calculateMeanRating(
    reviews: any[],
    stage?: ApplicationStage,
  ): number | null {
    const filteredReviews = stage
      ? reviews.filter((review) => review.stage === stage)
      : reviews;

    if (filteredReviews.length === 0) {
      return null;
    }

    return (
      filteredReviews.reduce((acc, review) => acc + review.rating, 0) /
      filteredReviews.length
    );
  }

  /**
   * Calculates mean rating for challenge stages (both technical and PM challenges)
   */
  private calculateChallengeMeanRating(reviews: any[]): number | null {
    const challengeReviews = reviews.filter(
      (review) =>
        review.stage === ApplicationStage.T_INTERVIEW ||
        review.stage === ApplicationStage.PM_CHALLENGE,
    );

    return this.calculateMeanRating(challengeReviews);
  }

  /**
   * Determines review stage based on reviews
   */
  private determineReviewStage(reviews: any[]): ReviewStage {
    return reviews.length > 0 ? ReviewStage.REVIEWED : ReviewStage.SUBMITTED;
  }

  /**
   * Gets assigned recruiters for an application
   */
  private async getAssignedRecruitersForApplication(
    app: Application,
  ): Promise<AssignedRecruiterDTO[]> {
    if (!app.assignedRecruiterIds || app.assignedRecruiterIds.length === 0) {
      return [];
    }

    const recruiters: User[] = await this.findRecruitersByIds(app.id);
    return recruiters.map((recruiter) => ({
      id: recruiter.id,
      firstName: recruiter.firstName,
      lastName: recruiter.lastName,
      // email and assignedAt omitted for list view
    }));
  }

  /**
   * Calculates all ratings for an application
   */
  private calculateAllRatings(reviews: any[]) {
    return {
      meanRatingAllReviews: this.calculateMeanRating(reviews),
      meanRatingResume: this.calculateMeanRating(
        reviews,
        ApplicationStage.APP_RECEIVED,
      ),
      meanRatingChallenge: this.calculateChallengeMeanRating(reviews),
      meanRatingTechnicalChallenge: this.calculateMeanRating(
        reviews,
        ApplicationStage.T_INTERVIEW,
      ),
      meanRatingInterview: this.calculateMeanRating(
        reviews,
        ApplicationStage.B_INTERVIEW,
      ),
    };
  }
}
