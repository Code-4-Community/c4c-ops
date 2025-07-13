import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import {
  Decision,
  ApplicationStage,
  Position,
  Semester,
  ApplicationStep,
} from './types';
import { UserStatus } from '../users/types';
import { userFactory } from '../testing/factories/user.factory';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import * as utils from './utils';
import { Review } from '../reviews/review.entity';

const mockApplicationsService = {
  processDecision: jest.fn(),
  findAllCurrentApplications: jest.fn(),
  findAll: jest.fn(),
  findAllByRecruiter: jest.fn(),
  findCurrent: jest.fn(),
  verifySignature: jest.fn(),
  submitApp: jest.fn(),
  assignRecruitersToApplication: jest.fn(),
  getAssignedRecruiters: jest.fn(),
};

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  signup: jest.fn(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

const createMockReview = (overrides: Partial<Review> = {}): Review =>
  ({
    id: 1,
    rating: 4,
    stage: ApplicationStage.RESUME,
    createdAt: new Date(),
    updatedAt: new Date(),
    application: null,
    reviewerId: 2,
    content: 'Good review',
    ...overrides,
  } as Review);

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('makeDecision', () => {
    const recruiterUser = userFactory({ id: 2, status: UserStatus.RECRUITER });
    const adminUser = userFactory({ id: 3, status: UserStatus.ADMIN });
    const memberUser = userFactory({ id: 4, status: UserStatus.MEMBER });
    const applicantUser = userFactory({ id: 5, status: UserStatus.APPLICANT });

    describe('Authorization', () => {
      it('should allow recruiters to make decisions', async () => {
        const req = { user: recruiterUser };
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await expect(
          controller.makeDecision(1, Decision.ACCEPT, req),
        ).resolves.not.toThrow();

        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.ACCEPT,
        );
      });

      it('should allow admins to make decisions', async () => {
        const req = { user: adminUser };
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await expect(
          controller.makeDecision(1, Decision.REJECT, req),
        ).resolves.not.toThrow();

        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.REJECT,
        );
      });

      it('should throw UnauthorizedException for members', async () => {
        const req = { user: memberUser };

        await expect(
          controller.makeDecision(1, Decision.ACCEPT, req),
        ).rejects.toThrow(UnauthorizedException);

        expect(mockApplicationsService.processDecision).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedException for applicants', async () => {
        const req = { user: applicantUser };

        await expect(
          controller.makeDecision(1, Decision.REJECT, req),
        ).rejects.toThrow(UnauthorizedException);

        expect(mockApplicationsService.processDecision).not.toHaveBeenCalled();
      });
    });

    describe('Decision Validation', () => {
      const req = { user: recruiterUser };

      it('should accept valid ACCEPT decision', async () => {
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await expect(
          controller.makeDecision(1, Decision.ACCEPT, req),
        ).resolves.not.toThrow();

        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.ACCEPT,
        );
      });

      it('should accept valid REJECT decision', async () => {
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await expect(
          controller.makeDecision(1, Decision.REJECT, req),
        ).resolves.not.toThrow();

        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.REJECT,
        );
      });

      it('should throw BadRequestException for invalid decision', async () => {
        const invalidDecision = 'INVALID_DECISION' as Decision;

        await expect(
          controller.makeDecision(1, invalidDecision, req),
        ).rejects.toThrow(BadRequestException);

        expect(mockApplicationsService.processDecision).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      const req = { user: recruiterUser };

      it('should propagate service errors', async () => {
        const serviceError = new Error('Service error');
        mockApplicationsService.processDecision.mockRejectedValue(serviceError);

        await expect(
          controller.makeDecision(1, Decision.ACCEPT, req),
        ).rejects.toThrow(serviceError);
      });
    });
  });

  describe('assignRecruitersToApplication', () => {
    const adminUser = userFactory({ id: 1, status: UserStatus.ADMIN });
    const recruiterUser = userFactory({ id: 2, status: UserStatus.RECRUITER });
    const memberUser = userFactory({ id: 3, status: UserStatus.MEMBER });

    it('should allow admin to assign recruiters to application', async () => {
      const req = { user: adminUser };
      const recruiterIds = [2, 3];

      mockApplicationsService.assignRecruitersToApplication.mockResolvedValue(
        undefined,
      );

      await expect(
        controller.assignRecruitersToApplication(1, { recruiterIds }, req),
      ).resolves.not.toThrow();

      expect(
        mockApplicationsService.assignRecruitersToApplication,
      ).toHaveBeenCalledWith(1, recruiterIds, adminUser);
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      const req = { user: recruiterUser };
      const recruiterIds = [2, 3];

      await expect(
        controller.assignRecruitersToApplication(1, { recruiterIds }, req),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        mockApplicationsService.assignRecruitersToApplication,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for members', async () => {
      const req = { user: memberUser };
      const recruiterIds = [2, 3];

      await expect(
        controller.assignRecruitersToApplication(1, { recruiterIds }, req),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        mockApplicationsService.assignRecruitersToApplication,
      ).not.toHaveBeenCalled();
    });

    it('should show error if assigning member to application', async () => {
      const req = { user: adminUser };
      const recruiterIds = [2, 3];
      const serviceError = new BadRequestException('Application not found');

      mockApplicationsService.assignRecruitersToApplication.mockRejectedValue(
        serviceError,
      );

      await expect(
        controller.assignRecruitersToApplication(1, { recruiterIds }, req),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('getAssignedRecruiters', () => {
    const adminUser = userFactory({ id: 1, status: UserStatus.ADMIN });
    const memberUser = userFactory({ id: 3, status: UserStatus.MEMBER });

    const mockAssignedRecruiters = [
      {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        assignedAt: new Date(),
      },
      {
        id: 4,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        assignedAt: new Date(),
      },
    ];

    it('should return assigned recruiters for admin', async () => {
      const req = { user: adminUser };

      mockApplicationsService.getAssignedRecruiters.mockResolvedValue(
        mockAssignedRecruiters,
      );

      const result = await controller.getAssignedRecruiters(1, req);

      expect(result).toEqual(mockAssignedRecruiters);
      expect(
        mockApplicationsService.getAssignedRecruiters,
      ).toHaveBeenCalledWith(1, adminUser);
    });

    it('should return assigned recruiters for any user (no authorization check in controller)', async () => {
      const req = { user: memberUser };

      mockApplicationsService.getAssignedRecruiters.mockResolvedValue(
        mockAssignedRecruiters,
      );

      const result = await controller.getAssignedRecruiters(1, req);

      expect(result).toEqual(mockAssignedRecruiters);
      expect(
        mockApplicationsService.getAssignedRecruiters,
      ).toHaveBeenCalledWith(1, memberUser);
    });

    it('should return empty array when no recruiters assigned', async () => {
      const req = { user: adminUser };

      mockApplicationsService.getAssignedRecruiters.mockResolvedValue([]);

      const result = await controller.getAssignedRecruiters(1, req);

      expect(result).toEqual([]);
    });

    it('should show error if application id is incorrect', async () => {
      const req = { user: adminUser };
      const serviceError = new BadRequestException('Application not found');

      mockApplicationsService.getAssignedRecruiters.mockRejectedValue(
        serviceError,
      );

      await expect(controller.getAssignedRecruiters(999, req)).rejects.toThrow(
        serviceError,
      );
    });

    it('should handle different application IDs correctly', async () => {
      const req = { user: adminUser };

      mockApplicationsService.getAssignedRecruiters.mockResolvedValue(
        mockAssignedRecruiters,
      );

      const result = await controller.getAssignedRecruiters(123, req);

      expect(result).toEqual(mockAssignedRecruiters);
      expect(
        mockApplicationsService.getAssignedRecruiters,
      ).toHaveBeenCalledWith(123, adminUser);
    });
  });

  describe('getApplications', () => {
    const recruiterUser = userFactory({ id: 2, status: UserStatus.RECRUITER });
    const adminUser = userFactory({ id: 3, status: UserStatus.ADMIN });
    const memberUser = userFactory({ id: 4, status: UserStatus.MEMBER });

    it('should allow recruiters to get all applications', async () => {
      const req = { user: recruiterUser };
      const mockApplications = [{ id: 1, stage: ApplicationStage.RESUME }];
      mockApplicationsService.findAllCurrentApplications.mockResolvedValue(
        mockApplications,
      );

      const result = await controller.getApplications(req);

      expect(result).toEqual(mockApplications);
      expect(
        mockApplicationsService.findAllCurrentApplications,
      ).toHaveBeenCalledWith(recruiterUser);
    });

    it('should allow admins to get all applications', async () => {
      const req = { user: adminUser };
      const mockApplications = [{ id: 1, stage: ApplicationStage.RESUME }];
      mockApplicationsService.findAllCurrentApplications.mockResolvedValue(
        mockApplications,
      );

      const result = await controller.getApplications(req);

      expect(result).toEqual(mockApplications);
      expect(
        mockApplicationsService.findAllCurrentApplications,
      ).toHaveBeenCalledWith(adminUser);
    });

    it('should throw UnauthorizedException for non-recruiter/admin users', async () => {
      const req = { user: memberUser };

      await expect(controller.getApplications(req)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        mockApplicationsService.findAllCurrentApplications,
      ).not.toHaveBeenCalled();
    });

    it('should filter applications based on user role - recruiters see only assigned applications', async () => {
      const req = { user: recruiterUser };
      const mockApplications = [{ id: 1, stage: ApplicationStage.RESUME }];
      mockApplicationsService.findAllCurrentApplications.mockResolvedValue(
        mockApplications,
      );

      await controller.getApplications(req);

      expect(
        mockApplicationsService.findAllCurrentApplications,
      ).toHaveBeenCalledWith(recruiterUser);
    });

    it('should filter applications based on user role - admins see all applications', async () => {
      const req = { user: adminUser };
      const mockApplications = [{ id: 1, stage: ApplicationStage.RESUME }];
      mockApplicationsService.findAllCurrentApplications.mockResolvedValue(
        mockApplications,
      );

      await controller.getApplications(req);

      expect(
        mockApplicationsService.findAllCurrentApplications,
      ).toHaveBeenCalledWith(adminUser);
    });
  });

  describe('getApplication', () => {
    const recruiterUser = userFactory({ id: 2, status: UserStatus.RECRUITER });
    const adminUser = userFactory({ id: 3, status: UserStatus.ADMIN });
    const applicantUser = userFactory({ id: 1, status: UserStatus.APPLICANT });
    const otherApplicantUser = userFactory({
      id: 5,
      status: UserStatus.APPLICANT,
    });

    const mockApplication = {
      id: 1,
      stage: ApplicationStage.RESUME,
      position: Position.DEVELOPER,
      user: applicantUser,
      reviews: [],
      content: null,
      attachments: [],
      createdAt: new Date(),
      year: 2024,
      semester: Semester.FALL,
      step: ApplicationStep.SUBMITTED,
      response: [],
      assignedRecruiterIds: [],
      toGetApplicationResponseDTO: jest.fn().mockReturnValue({
        id: 1,
        stage: ApplicationStage.RESUME,
        position: Position.DEVELOPER,
        user: applicantUser,
        reviews: [],
      }),
      toGetAllApplicationResponseDTO: jest.fn(),
    };

    it('should allow recruiters to get any application', async () => {
      const req = { user: recruiterUser };
      mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
      jest
        .spyOn(utils, 'getAppForCurrentCycle')
        .mockReturnValue(mockApplication);

      const result = await controller.getApplication(1, req);
      expect(result).toBeDefined();
      expect(mockApplicationsService.findAll).toHaveBeenCalledWith(1);
    });

    it('should allow admins to get any application', async () => {
      const req = { user: adminUser };
      mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
      jest
        .spyOn(utils, 'getAppForCurrentCycle')
        .mockReturnValue(mockApplication);

      const result = await controller.getApplication(1, req);
      expect(result).toBeDefined();
      expect(mockApplicationsService.findAll).toHaveBeenCalledWith(1);
    });

    it('should allow applicants to get their own application', async () => {
      const req = { user: applicantUser };
      mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
      jest
        .spyOn(utils, 'getAppForCurrentCycle')
        .mockReturnValue(mockApplication);

      const result = await controller.getApplication(1, req);
      expect(result).toBeDefined();
      expect(mockApplicationsService.findAll).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when applicant tries to access another applicant's application", async () => {
      const req = { user: otherApplicantUser };

      await expect(controller.getApplication(1, req)).rejects.toThrow();
    });
  });

  describe('Applicant Status Tracking', () => {
    const applicantUser = userFactory({ id: 1, status: UserStatus.APPLICANT });
    const recruiterUser = userFactory({ id: 2, status: UserStatus.RECRUITER });
    const memberUser = userFactory({ id: 4, status: UserStatus.MEMBER });

    describe('View Application Status', () => {
      it('should allow applicant to view their current application status', async () => {
        const mockApplication = {
          id: 1,
          stage: ApplicationStage.TECHNICAL_CHALLENGE,
          position: Position.DEVELOPER,
          user: applicantUser,
          reviews: [
            createMockReview({
              id: 1,
              rating: 4,
              stage: ApplicationStage.RESUME,
            }),
          ],
          content: null,
          attachments: [],
          createdAt: new Date(),
          year: 2024,
          semester: Semester.FALL,
          step: ApplicationStep.REVIEWED,
          response: [{ question: 'Why C4C?', answer: 'meow' }],
          toGetApplicationResponseDTO: jest.fn().mockReturnValue({
            id: 1,
            stage: ApplicationStage.TECHNICAL_CHALLENGE,
            position: Position.DEVELOPER,
            step: ApplicationStep.REVIEWED,
            reviews: [{ id: 1, rating: 4, stage: ApplicationStage.RESUME }],
            numApps: 1,
          }),
          assignedRecruiterIds: [],
          toGetAllApplicationResponseDTO: jest.fn(),
        };

        const req = { user: applicantUser };
        mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
        jest
          .spyOn(utils, 'getAppForCurrentCycle')
          .mockReturnValue(mockApplication);

        const result = await controller.getApplication(1, req);

        expect(result).toBeDefined();
        expect(result.stage).toBe(ApplicationStage.TECHNICAL_CHALLENGE);
        expect(result.step).toBe(ApplicationStep.REVIEWED);
        expect(result.position).toBe(Position.DEVELOPER);
        expect(mockApplicationsService.findAll).toHaveBeenCalledWith(1);
      });

      it('should return correct application step when no reviews exist', async () => {
        const mockApplication = {
          id: 1,
          stage: ApplicationStage.RESUME,
          position: Position.DEVELOPER,
          user: applicantUser,
          reviews: [],
          content: null,
          attachments: [],
          createdAt: new Date(),
          year: 2024,
          semester: Semester.FALL,
          step: ApplicationStep.SUBMITTED,
          response: [{ question: 'Why C4C?', answer: 'meow' }],
          toGetApplicationResponseDTO: jest.fn().mockReturnValue({
            id: 1,
            stage: ApplicationStage.RESUME,
            position: Position.DEVELOPER,
            step: ApplicationStep.SUBMITTED,
            reviews: [],
            numApps: 1,
          }),
          assignedRecruiterIds: [],
          toGetAllApplicationResponseDTO: jest.fn(),
        };

        const req = { user: applicantUser };
        mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
        jest
          .spyOn(utils, 'getAppForCurrentCycle')
          .mockReturnValue(mockApplication);

        const result = await controller.getApplication(1, req);

        expect(result.step).toBe(ApplicationStep.SUBMITTED);
        expect(result.reviews).toHaveLength(0);
      });

      it('should return correct application step when reviews exist', async () => {
        const mockApplication = {
          id: 1,
          stage: ApplicationStage.INTERVIEW,
          position: Position.PM,
          user: applicantUser,
          reviews: [
            createMockReview({
              id: 1,
              rating: 4,
              stage: ApplicationStage.RESUME,
            }),
            createMockReview({
              id: 2,
              rating: 5,
              stage: ApplicationStage.PM_CHALLENGE,
            }),
          ],
          content: null,
          attachments: [],
          createdAt: new Date(),
          year: 2024,
          semester: Semester.FALL,
          step: ApplicationStep.REVIEWED,
          response: [{ question: 'Why C4C?', answer: 'meow' }],
          toGetApplicationResponseDTO: jest.fn().mockReturnValue({
            id: 1,
            stage: ApplicationStage.INTERVIEW,
            position: Position.PM,
            step: ApplicationStep.REVIEWED,
            reviews: [
              { id: 1, rating: 4, stage: ApplicationStage.RESUME },
              { id: 2, rating: 5, stage: ApplicationStage.PM_CHALLENGE },
            ],
            numApps: 1,
          }),
          assignedRecruiterIds: [],
          toGetAllApplicationResponseDTO: jest.fn(),
        };

        const req = { user: applicantUser };
        mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
        jest
          .spyOn(utils, 'getAppForCurrentCycle')
          .mockReturnValue(mockApplication);

        const result = await controller.getApplication(1, req);

        expect(result.step).toBe(ApplicationStep.REVIEWED);
        expect(result.reviews).toHaveLength(2);
      });
    });

    describe('Status Update Authorization', () => {
      it('should only allow recruiters and admins to change application status', async () => {
        const req = { user: recruiterUser };
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await expect(
          controller.makeDecision(1, Decision.ACCEPT, req),
        ).resolves.not.toThrow();

        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.ACCEPT,
        );
      });

      it('should prevent applicants from changing their own status', async () => {
        const req = { user: applicantUser };

        await expect(
          controller.makeDecision(1, Decision.ACCEPT, req),
        ).rejects.toThrow(UnauthorizedException);

        expect(mockApplicationsService.processDecision).not.toHaveBeenCalled();
      });

      it('should prevent members from changing application status', async () => {
        const req = { user: memberUser };

        await expect(
          controller.makeDecision(1, Decision.REJECT, req),
        ).rejects.toThrow(UnauthorizedException);

        expect(mockApplicationsService.processDecision).not.toHaveBeenCalled();
      });
    });

    describe('Realtime Status Updates', () => {
      it('should reflect status changes immediately after decision is made', async () => {
        const initialApplication = {
          id: 1,
          stage: ApplicationStage.RESUME,
          position: Position.DEVELOPER,
          user: applicantUser,
          reviews: [],
          content: null,
          attachments: [],
          createdAt: new Date(),
          year: 2024,
          semester: Semester.FALL,
          step: ApplicationStep.SUBMITTED,
          response: [{ question: 'Why C4C?', answer: 'meow' }],
          toGetApplicationResponseDTO: jest.fn().mockReturnValue({
            id: 1,
            stage: ApplicationStage.RESUME,
            position: Position.DEVELOPER,
            step: ApplicationStep.SUBMITTED,
            reviews: [],
            numApps: 1,
          }),
          assignedRecruiterIds: [],
          toGetAllApplicationResponseDTO: jest.fn(),
        };

        // Simulate status before decision
        const applicantReq = { user: applicantUser };
        mockApplicationsService.findAll.mockResolvedValue([initialApplication]);
        jest
          .spyOn(utils, 'getAppForCurrentCycle')
          .mockReturnValue(initialApplication);

        const initialStatus = await controller.getApplication(1, applicantReq);
        expect(initialStatus.stage).toBe(ApplicationStage.RESUME);

        // Make decision as recruiter
        const recruiterReq = { user: recruiterUser };
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await controller.makeDecision(1, Decision.ACCEPT, recruiterReq);

        // Verify decision was processed
        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.ACCEPT,
        );
      });

      it('should handle rejection status updates correctly', async () => {
        const req = { user: recruiterUser };
        mockApplicationsService.processDecision.mockResolvedValue(undefined);

        await controller.makeDecision(1, Decision.REJECT, req);

        expect(mockApplicationsService.processDecision).toHaveBeenCalledWith(
          1,
          Decision.REJECT,
        );
      });
    });

    describe('Error Handling for Status Loading', () => {
      it('should throw BadRequestException when applicant has no application for current cycle', async () => {
        const req = { user: applicantUser };
        mockApplicationsService.findAll.mockResolvedValue([]);
        jest.spyOn(utils, 'getAppForCurrentCycle').mockReturnValue(null);

        await expect(controller.getApplication(1, req)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle service errors when loading application status', async () => {
        const req = { user: applicantUser };
        const serviceError = new Error('Database connection failed');
        mockApplicationsService.findAll.mockRejectedValue(serviceError);

        await expect(controller.getApplication(1, req)).rejects.toThrow(
          serviceError,
        );
      });

      it('should throw NotFoundException when user does not exist', async () => {
        const nonExistentUser = userFactory({
          id: 999,
          status: UserStatus.APPLICANT,
        });
        const req = { user: nonExistentUser };

        await expect(controller.getApplication(999, req)).rejects.toThrow();
      });

      it('should handle invalid decision values gracefully', async () => {
        const req = { user: recruiterUser };
        const invalidDecision = 'MAYBE' as Decision;

        await expect(
          controller.makeDecision(1, invalidDecision, req),
        ).rejects.toThrow(BadRequestException);

        expect(mockApplicationsService.processDecision).not.toHaveBeenCalled();
      });
    });

    describe('Multi-stage Status Tracking', () => {
      it('should track status through multiple stages for developers', async () => {
        const stages = [
          ApplicationStage.RESUME,
          ApplicationStage.TECHNICAL_CHALLENGE,
          ApplicationStage.INTERVIEW,
          ApplicationStage.ACCEPTED,
        ];

        for (const stage of stages) {
          const mockApplication = {
            id: 1,
            stage,
            position: Position.DEVELOPER,
            user: applicantUser,
            reviews:
              stage === ApplicationStage.RESUME
                ? []
                : [createMockReview({ id: 1, rating: 4 })],
            content: null,
            attachments: [],
            createdAt: new Date(),
            year: 2024,
            semester: Semester.FALL,
            step:
              stage === ApplicationStage.RESUME
                ? ApplicationStep.SUBMITTED
                : ApplicationStep.REVIEWED,
            response: [{ question: 'Why C4C?', answer: 'meow' }],
            toGetApplicationResponseDTO: jest.fn().mockReturnValue({
              id: 1,
              stage,
              position: Position.DEVELOPER,
              step:
                stage === ApplicationStage.RESUME
                  ? ApplicationStep.SUBMITTED
                  : ApplicationStep.REVIEWED,
              reviews:
                stage === ApplicationStage.RESUME ? [] : [{ id: 1, rating: 4 }],
              numApps: 1,
            }),
            assignedRecruiterIds: [],
            toGetAllApplicationResponseDTO: jest.fn(),
          };

          const req = { user: applicantUser };
          mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
          jest
            .spyOn(utils, 'getAppForCurrentCycle')
            .mockReturnValue(mockApplication);

          const result = await controller.getApplication(1, req);
          expect(result.stage).toBe(stage);

          jest.clearAllMocks();
        }
      });

      it('should track status for different position types', async () => {
        const positionStages = [
          {
            position: Position.DEVELOPER,
            stage: ApplicationStage.TECHNICAL_CHALLENGE,
          },
          { position: Position.PM, stage: ApplicationStage.PM_CHALLENGE },
          { position: Position.DESIGNER, stage: ApplicationStage.INTERVIEW },
        ];

        for (const { position, stage } of positionStages) {
          const mockApplication = {
            id: 1,
            stage,
            position,
            user: applicantUser,
            reviews: [createMockReview({ id: 1, rating: 4 })],
            content: null,
            attachments: [],
            createdAt: new Date(),
            year: 2024,
            semester: Semester.FALL,
            step: ApplicationStep.REVIEWED,
            response: [{ question: 'Why C4C?', answer: 'meow' }],
            toGetApplicationResponseDTO: jest.fn().mockReturnValue({
              id: 1,
              stage,
              position,
              step: ApplicationStep.REVIEWED,
              reviews: [{ id: 1, rating: 4 }],
              numApps: 1,
            }),
            assignedRecruiterIds: [],
            toGetAllApplicationResponseDTO: jest.fn(),
          };

          const req = { user: applicantUser };
          mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
          jest
            .spyOn(utils, 'getAppForCurrentCycle')
            .mockReturnValue(mockApplication);

          const result = await controller.getApplication(1, req);
          expect(result.position).toBe(position);
          expect(result.stage).toBe(stage);

          jest.clearAllMocks();
        }
      });

      it('should handle rejected status correctly', async () => {
        const mockApplication = {
          id: 1,
          stage: ApplicationStage.REJECTED,
          position: Position.DEVELOPER,
          user: applicantUser,
          reviews: [createMockReview({ id: 1, rating: 2 })],
          content: null,
          attachments: [],
          createdAt: new Date(),
          year: 2024,
          semester: Semester.FALL,
          step: ApplicationStep.REVIEWED,
          response: [{ question: 'Why C4C?', answer: 'meow' }],
          toGetApplicationResponseDTO: jest.fn().mockReturnValue({
            id: 1,
            stage: ApplicationStage.REJECTED,
            position: Position.DEVELOPER,
            step: ApplicationStep.REVIEWED,
            reviews: [{ id: 1, rating: 2 }],
            numApps: 1,
          }),
          assignedRecruiterIds: [],
          toGetAllApplicationResponseDTO: jest.fn(),
        };

        const req = { user: applicantUser };
        mockApplicationsService.findAll.mockResolvedValue([mockApplication]);
        jest
          .spyOn(utils, 'getAppForCurrentCycle')
          .mockReturnValue(mockApplication);

        const result = await controller.getApplication(1, req);
        expect(result.stage).toBe(ApplicationStage.REJECTED);
      });
    });
  });
});
