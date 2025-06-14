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

const mockApplicationsService = {
  processDecision: jest.fn(),
  findAllCurrentApplications: jest.fn(),
  findAll: jest.fn(),
  findCurrent: jest.fn(),
  verifySignature: jest.fn(),
  submitApp: jest.fn(),
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
      ).toHaveBeenCalled();
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
      ).toHaveBeenCalled();
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
});
