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
import { Decision, Response } from './types';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { UserStatus } from '../users/types';
import { Position, ApplicationStage, ApplicationStep, Semester } from './types';
import { GetAllApplicationResponseDTO } from './dto/get-all-application.response.dto';
import { AssignedRecruiterDTO } from './dto/get-application.response.dto';
import { stagesMap } from './applications.constants';

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

    // Check permissions based on user role
    if (!this.canViewAssignedRecruiters(application, currentUser)) {
      return []; // Return empty array if user can't see assignments
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
   * Determines if a user can view assigned recruiters for an application.
   *
   * @param application the application to check
   * @param currentUser the user requesting the information
   * @returns { boolean } true if user can view assignments
   */
  private canViewAssignedRecruiters(
    application: Application,
    currentUser: User,
  ): boolean {
    // Admins can see all assignments
    if (currentUser.status === UserStatus.ADMIN) {
      return true;
    }

    // Recruiters can only see assignments if they are assigned to this application
    if (currentUser.status === UserStatus.RECRUITER) {
      return application.assignedRecruiterIds.includes(currentUser.id);
    }

    // Applicants and other roles cannot see assignments
    return false;
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
    // Base query for current cycle applications
    interface ApplicationWhereClause {
      year: number;
      semester: Semester;
      assignedRecruiterIds?: ReturnType<typeof In>;
    }

    const baseWhere: ApplicationWhereClause = {
      year: getCurrentYear(),
      semester: getCurrentSemester(),
    };

    // If user is a recruiter, only show applications assigned to them by
    // checking where assignedRecruiterIds includes the user's id
    if (currentUser && currentUser.status === UserStatus.RECRUITER) {
      baseWhere.assignedRecruiterIds = In([currentUser.id]);
    }

    const applications = await this.applicationsRepository.find({
      where: baseWhere,
      relations: ['user', 'reviews'],
    });

    const allApplicationsDto = await Promise.all(
      applications.map(async (app) => {
        // Initialize variables for storing mean ratings
        let meanRatingAllReviews = null;
        let meanRatingResume = null;
        let meanRatingChallenge = null; // Default to null for DESIGNERS
        let meanRatingTechnicalChallenge = null;
        let meanRatingInterview = null;
        let applicationStep = null;

        // Calculate mean rating of all reviews
        if (app.reviews.length > 0) {
          meanRatingAllReviews =
            app.reviews.reduce((acc, review) => acc + review.rating, 0) /
            app.reviews.length;
        }

        // Filter reviews by stage and calculate mean ratings accordingly
        const resumeReviews = app.reviews.filter(
          (review) => review.stage === ApplicationStage.RESUME,
        );
        const challengeReviews = app.reviews.filter(
          (review) =>
            review.stage === ApplicationStage.TECHNICAL_CHALLENGE ||
            review.stage === ApplicationStage.PM_CHALLENGE,
        );
        const technicalChallengeReviews = app.reviews.filter(
          (review) => review.stage === ApplicationStage.TECHNICAL_CHALLENGE,
        );
        const interviewReviews = app.reviews.filter(
          (review) => review.stage === ApplicationStage.INTERVIEW,
        );

        // Mean rating for RESUME stage
        if (resumeReviews.length > 0) {
          meanRatingResume =
            resumeReviews.reduce((acc, review) => acc + review.rating, 0) /
            resumeReviews.length;
        }

        // Mean rating for CHALLENGE stage (for DEVS and PMS)
        if (challengeReviews.length > 0) {
          meanRatingChallenge =
            challengeReviews.reduce((acc, review) => acc + review.rating, 0) /
            challengeReviews.length;
        }

        // Mean rating for TECHNICAL_CHALLENGE stage (specifically for DEVS)
        if (technicalChallengeReviews.length > 0) {
          meanRatingTechnicalChallenge =
            technicalChallengeReviews.reduce(
              (acc, review) => acc + review.rating,
              0,
            ) / technicalChallengeReviews.length;
        }

        // Mean rating for INTERVIEW stage
        if (interviewReviews.length > 0) {
          meanRatingInterview =
            interviewReviews.reduce((acc, review) => acc + review.rating, 0) /
            interviewReviews.length;
        }

        // Tthe application step
        if (app.reviews.length > 0) {
          applicationStep = ApplicationStep.REVIEWED;
        } else {
          applicationStep = ApplicationStep.SUBMITTED;
        }

        // Get assigned recruiters for this application
        let assignedRecruiters: AssignedRecruiterDTO[] = [];
        if (app.assignedRecruiterIds && app.assignedRecruiterIds.length > 0) {
          const recruiters: User[] = await this.findRecruitersByIds(app.id);
          assignedRecruiters = recruiters.map((recruiter) => ({
            id: recruiter.id,
            firstName: recruiter.firstName,
            lastName: recruiter.lastName,
            // email and assignedAt omitted for list view
          }));
        }

        return app.toGetAllApplicationResponseDTO(
          meanRatingAllReviews,
          meanRatingResume,
          meanRatingChallenge,
          meanRatingTechnicalChallenge,
          meanRatingInterview,
          applicationStep,
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
}
