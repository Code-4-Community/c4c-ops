import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { UsersService } from '../users/users.service';
import {
  Decision,
  ApplicationStage,
  Position,
  Semester,
  StageProgress,
  ReviewStatus,
} from './types';
import { UserStatus } from '../users/types';
import { userFactory } from '../testing/factories/user.factory';
import * as utils from './utils';

const mockApplicationsRepository: Partial<Repository<Application>> = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockUsersService: Partial<UsersService> = {
  findByEmail: jest.fn(),
};

const createMockApplication = (
  overrides: Partial<Application> = {},
): Application => ({
  id: 1,
  user: userFactory({ id: 1, status: UserStatus.APPLICANT }),
  createdAt: new Date(),
  year: 2024,
  semester: Semester.FALL,
  position: Position.DEVELOPER,
  stage: ApplicationStage.APP_RECEIVED,
  stageProgress: StageProgress.PENDING,
  reviewStatus: ReviewStatus.UNASSIGNED,
  response: [],
  reviews: [],
  content: null,
  attachments: [],
  assignedRecruiterIds: [],
  toGetApplicationResponseDTO: jest.fn(),
  toGetAllApplicationResponseDTO: jest.fn(),
  ...overrides,
});

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationsRepository: Repository<Application>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationsRepository = module.get<Repository<Application>>(
      getRepositoryToken(Application),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processDecision', () => {
    describe('Stage Progression for Developers', () => {
      it('should move from APP_RECEIVED to T_INTERVIEW when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.APP_RECEIVED,
          position: Position.DEVELOPER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.T_INTERVIEW);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });

      it('should move from T_INTERVIEW to B_INTERVIEW when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.T_INTERVIEW,
          position: Position.DEVELOPER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.B_INTERVIEW);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });

      it('should move from B_INTERVIEW to ACCEPTED when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.B_INTERVIEW,
          position: Position.DEVELOPER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.ACCEPTED);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });

      it('should throw error when trying to progress from ACCEPTED stage', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.ACCEPTED,
          position: Position.DEVELOPER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);

        await expect(
          service.processDecision(1, Decision.ACCEPT),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Stage Progression for Product Managers', () => {
      it('should move from APP_RECEIVED to PM_CHALLENGE when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.APP_RECEIVED,
          position: Position.PM,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.PM_CHALLENGE);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });

      it('should move from PM_CHALLENGE to B_INTERVIEW when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.PM_CHALLENGE,
          position: Position.PM,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.B_INTERVIEW);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });

      it('should move from B_INTERVIEW to ACCEPTED when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.B_INTERVIEW,
          position: Position.PM,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.ACCEPTED);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });
    });

    describe('Stage Progression for Designers', () => {
      it('should move from APP_RECEIVED to B_INTERVIEW when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.APP_RECEIVED,
          position: Position.DESIGNER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.B_INTERVIEW);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });

      it('should move from B_INTERVIEW to ACCEPTED when accepted', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.B_INTERVIEW,
          position: Position.DESIGNER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.ACCEPT);

        expect(application.stage).toBe(ApplicationStage.ACCEPTED);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });
    });

    describe('Rejection Logic', () => {
      it('should set stage to REJECTED when decision is REJECT from any stage', async () => {
        const stages = [
          ApplicationStage.APP_RECEIVED,
          ApplicationStage.T_INTERVIEW,
          ApplicationStage.PM_CHALLENGE,
          ApplicationStage.B_INTERVIEW,
        ];

        for (const stage of stages) {
          const application = createMockApplication({ stage });
          jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
          jest
            .spyOn(applicationsRepository, 'save')
            .mockResolvedValue(application);

          await service.processDecision(1, Decision.REJECT);

          expect(application.stage).toBe(ApplicationStage.REJECTED);
          expect(applicationsRepository.save).toHaveBeenCalledWith(application);

          jest.clearAllMocks();
        }
      });

      it('should not change stage if already rejected', async () => {
        const application = createMockApplication({
          stage: ApplicationStage.REJECTED,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
        jest
          .spyOn(applicationsRepository, 'save')
          .mockResolvedValue(application);

        await service.processDecision(1, Decision.REJECT);

        expect(application.stage).toBe(ApplicationStage.REJECTED);
        expect(applicationsRepository.save).toHaveBeenCalledWith(application);
      });
    });

    describe('Error Handling', () => {
      it('should throw error when application is not found', async () => {
        jest
          .spyOn(service, 'findCurrent')
          .mockRejectedValue(
            new BadRequestException(
              "Applicant hasn't applied in the current cycle",
            ),
          );

        await expect(
          service.processDecision(999, Decision.ACCEPT),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw error for invalid stage', async () => {
        const application = createMockApplication({
          stage: 'INVALID_STAGE' as ApplicationStage,
          position: Position.DEVELOPER,
        });

        jest.spyOn(service, 'findCurrent').mockResolvedValue(application);

        await expect(
          service.processDecision(1, Decision.ACCEPT),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('findCurrent', () => {
    it('should return current application for valid user', async () => {
      const mockApplications = [
        createMockApplication({ year: 2024, semester: Semester.FALL }),
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockApplications);

      jest
        .spyOn(utils, 'getAppForCurrentCycle')
        .mockReturnValue(mockApplications[0]);

      const result = await service.findCurrent(1);

      expect(result).toEqual(mockApplications[0]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when no current application exists', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      jest.spyOn(utils, 'getAppForCurrentCycle').mockReturnValue(null);

      await expect(service.findCurrent(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitApp', () => {
    const mockUser = userFactory({
      id: 1,
      status: UserStatus.APPLICANT,
      applications: [],
    });
    const mockResponse = [{ question: 'Why C4C?', answer: 'meow' }];

    it('should create and save new application', async () => {
      const newApplication = createMockApplication();

      jest
        .spyOn(applicationsRepository, 'create')
        .mockReturnValue(newApplication);
      jest
        .spyOn(applicationsRepository, 'save')
        .mockResolvedValue(newApplication);
      jest.spyOn(utils, 'getAppForCurrentCycle').mockReturnValue(null);

      const result = await service.submitApp(mockResponse, mockUser);

      expect(applicationsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          position: Position.DEVELOPER,
          stage: ApplicationStage.APP_RECEIVED,
          response: mockResponse,
        }),
      );
      expect(applicationsRepository.save).toHaveBeenCalledWith(newApplication);
      expect(result).toEqual(newApplication);
    });

    it('should throw UnauthorizedException if user already has application for current cycle', async () => {
      const existingApp = createMockApplication({
        year: 2024,
        semester: Semester.FALL,
      });
      const userWithApplication = userFactory({
        id: 1,
        status: UserStatus.APPLICANT,
        applications: [existingApp],
      });

      jest.spyOn(utils, 'getAppForCurrentCycle').mockReturnValue(existingApp);

      await expect(
        service.submitApp(mockResponse, userWithApplication),
      ).rejects.toThrow(UnauthorizedException);

      expect(applicationsRepository.create).not.toHaveBeenCalled();
      expect(applicationsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: submit -> review -> accept -> progress', async () => {
      const user = userFactory({
        id: 1,
        status: UserStatus.APPLICANT,
        applications: [],
      });
      const response = [{ question: 'Why C4C?', answer: 'meow' }];

      const newApplication = createMockApplication({
        stage: ApplicationStage.APP_RECEIVED,
        position: Position.DEVELOPER,
      });

      jest
        .spyOn(applicationsRepository, 'create')
        .mockReturnValue(newApplication);
      jest
        .spyOn(applicationsRepository, 'save')
        .mockResolvedValue(newApplication);
      jest.spyOn(utils, 'getAppForCurrentCycle').mockReturnValue(null);

      const submittedApp = await service.submitApp(response, user);
      expect(submittedApp.stage).toBe(ApplicationStage.APP_RECEIVED);

      jest.spyOn(service, 'findCurrent').mockResolvedValue(submittedApp);

      await service.processDecision(1, Decision.ACCEPT);
      expect(submittedApp.stage).toBe(ApplicationStage.T_INTERVIEW);

      await service.processDecision(1, Decision.ACCEPT);
      expect(submittedApp.stage).toBe(ApplicationStage.B_INTERVIEW);

      await service.processDecision(1, Decision.ACCEPT);
      expect(submittedApp.stage).toBe(ApplicationStage.ACCEPTED);
    });

    it('should handle rejection at any stage', async () => {
      const application = createMockApplication({
        stage: ApplicationStage.T_INTERVIEW,
        position: Position.DEVELOPER,
      });

      jest.spyOn(service, 'findCurrent').mockResolvedValue(application);
      jest.spyOn(applicationsRepository, 'save').mockResolvedValue(application);

      await service.processDecision(1, Decision.REJECT);

      expect(application.stage).toBe(ApplicationStage.REJECTED);
    });
  });
});
