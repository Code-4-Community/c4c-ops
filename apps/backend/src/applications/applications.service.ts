import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import {
  getAppForCurrentCycle,
  getCurrentCycle,
  getCurrentSemester,
  getCurrentYear,
} from './utils';
import {
  Decision,
  Response,
  ReviewStatus,
  Position,
  ApplicationStage,
  StageProgress,
  Semester,
} from '@shared/types/application.types';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { forEach } from 'lodash';
import { Review } from '../reviews/review.entity';
import { UserStatus } from '@shared/types/user.types';
import { stagesMap } from './applications.constants';
import { GetAllApplicationResponseDTO } from './dto/get-all-applications.response.dto';
import { AssignedRecruiterDTO } from './dto/assigned-recruiter.dto';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

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
  async submitApp(
    application: Response[],
    user: User,
    role?: string,
  ): Promise<Application> {
    const { applications: existingApplications } = user;
    const { year, semester } = getCurrentCycle();

    // TODO:
    // reach out and find what the index would be in application
    // print out and log what you're doing just in case theres weird stuff
    // helper method to convert that string into the position data type

    // TODO Maybe allow for more applications?
    if (getAppForCurrentCycle(existingApplications)) {
      throw new UnauthorizedException(
        `Applicant ${user.id} has already submitted an application for the current cycle`,
      );
    }

    // Determine position from provided role (if any). Default to DEVELOPER.
    let positionEnum = Position.DEVELOPER;
    this.logger.debug(
      `submitApp called with role='${role}' for user ${user.email}`,
    );
    if (role) {
      const r = (role || '').toString().toUpperCase();
      if (r === 'PM' || r === 'PRODUCT_MANAGER' || r === 'PRODUCT MANAGER') {
        positionEnum = Position.PM;
      } else if (r === 'DESIGNER') {
        positionEnum = Position.DESIGNER;
      } else if (r === 'DEVELOPER') {
        positionEnum = Position.DEVELOPER;
      }
    }
    this.logger.debug(`Mapped role '${role}' -> position '${positionEnum}'`);

    const newApplication: Application = this.applicationsRepository.create({
      user,
      createdAt: new Date(),
      year,
      semester,
      position: positionEnum,
      stage: ApplicationStage.APP_RECEIVED,
      stageProgress: StageProgress.PENDING,
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

    application.assignedRecruiterIds = [...new Set(recruiterIds)];
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

    if (!application) {
      throw new BadRequestException(
        `Application for applicant ${applicantId} not found`,
      );
    }

    // Check if application is in a terminal state
    if (
      application.stage === ApplicationStage.ACCEPTED ||
      application.stage === ApplicationStage.REJECTED
    ) {
      throw new BadRequestException(
        `Application is already in terminal state: ${application.stage}`,
      );
    }

    let newStage: ApplicationStage;

    if (decision === Decision.REJECT) {
      newStage = ApplicationStage.REJECTED;
    } else if (decision === Decision.ACCEPT) {
      const stagesArr = stagesMap[application.position];
      const currentIndex = stagesArr.indexOf(application.stage);

      if (currentIndex === -1) {
        // Current stage not in normal flow
        throw new BadRequestException(
          `Invalid stage ${application.stage} for position ${application.position}`,
        );
      }

      // Check if we're at the last stage in the pipeline
      if (currentIndex === stagesArr.length - 1) {
        // Final acceptance
        newStage = ApplicationStage.ACCEPTED;
      } else {
        // Move to next stage in the pipeline
        newStage = stagesArr[currentIndex + 1];
      }
    } else {
      throw new BadRequestException(`Invalid decision: ${decision}`);
    }

    application.stage = newStage;
    application.stageProgress = StageProgress.PENDING; // Reset progress for new stage

    // Save the updated stage
    await this.applicationsRepository.save(application);
  }

  /**
   * Updates the Review Status of a user's application
   */
  async updateReviewStatus(
    userId: number,
    newReviewStatus: ReviewStatus,
  ): Promise<Application> {
    const updateResult = await this.applicationsRepository
      .createQueryBuilder()
      .update(Application)
      .set({ reviewStatus: newReviewStatus })
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
   * Validates that the stage transition is valid for the position. First if the stage
   * exists, then if it is not already in a terminal state
   */
  async updateStage(
    userId: number,
    newStage: ApplicationStage,
  ): Promise<Application> {
    // First get the application to validate the transition
    const application = await this.applicationsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'reviews'],
    });

    if (!application) {
      throw new BadRequestException(`Application for user ${userId} not found`);
    }

    // Validate stage transition is valid for this position
    const validStages = stagesMap[application.position];
    const isTerminalStage =
      newStage === ApplicationStage.ACCEPTED ||
      newStage === ApplicationStage.REJECTED;

    if (!isTerminalStage && !validStages.includes(newStage)) {
      throw new BadRequestException(
        `Stage ${newStage} is not valid for position ${application.position}`,
      );
    }

    // Update the stage
    application.stage = newStage;
    application.stageProgress = StageProgress.PENDING;

    return await this.applicationsRepository.save(application);
  }

  async findAll(userId: number): Promise<Application[]> {
    this.logger.debug(`Fetching all applications for user ${userId}`);
    const apps = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'reviews'],
    });
    this.logger.debug(`Found ${apps.length} applications for user ${userId}`);
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
        const stageProgress = this.determineStageProgress(app, app.reviews);
        const assignedRecruiters =
          await this.getAssignedRecruitersForApplication(app);

        return app.toGetAllApplicationResponseDTO(
          ratings.meanRatingAllReviews,
          ratings.meanRatingResume,
          ratings.meanRatingChallenge,
          ratings.meanRatingTechnicalChallenge,
          ratings.meanRatingInterview,
          stageProgress,
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
    reviews: Review[],
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
  private calculateChallengeMeanRating(reviews: Review[]): number | null {
    const challengeReviews = reviews.filter(
      (review) =>
        review.stage === ApplicationStage.T_INTERVIEW ||
        review.stage === ApplicationStage.PM_CHALLENGE,
    );

    return this.calculateMeanRating(challengeReviews);
  }

  /**
   * Determines stage progress based on current stage and reviews
   * A stage is considered COMPLETED if it has been reviewed
   * Terminal stages (ACCEPTED/REJECTED) are always COMPLETED
   */
  /**
   * A stage is considered COMPLETED only when all assigned recruiters have
   * submitted a review for that stage. If no recruiters are assigned, the
   * stage remains PENDING even if admins or others submit reviews.
   */
  private determineStageProgress(
    app: Application,
    reviews: any[],
  ): StageProgress {
    const stage = app.stage;

    // Terminal stages are always completed
    if (
      stage === ApplicationStage.ACCEPTED ||
      stage === ApplicationStage.REJECTED
    ) {
      return StageProgress.COMPLETED;
    }

    const assignedRecruiterIds = app.assignedRecruiterIds || [];

    // If there are no assigned recruiters, the stage should not progress
    if (assignedRecruiterIds.length === 0) {
      return StageProgress.PENDING;
    }

    // Collect reviewer IDs who have submitted a review for the current stage
    const reviewerIdsForStage = new Set(
      reviews
        .filter((review) => review.stage === stage)
        .map((review) => review.reviewerId),
    );

    // Check that every assigned recruiter has submitted a review for this stage
    const allAssignedReviewed = assignedRecruiterIds.every((id) =>
      reviewerIdsForStage.has(id),
    );

    return allAssignedReviewed
      ? StageProgress.COMPLETED
      : StageProgress.PENDING;
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
  private calculateAllRatings(reviews: Review[]) {
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
