import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { defaultUser } from '../testing/factories/user.factory';

const mockUsersService: Partial<UsersService> = {
  findOne: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return the user', async () => {
      jest
        .spyOn(mockUsersService, 'findOne')
        .mockReturnValue(Promise.resolve(defaultUser));

      expect(await controller.getUser(1, defaultUser)).toBe(defaultUser);
    });

    it("should throw an error if the user can't be found", async () => {
      const errorMessge = 'Cannot find user';

      jest
        .spyOn(mockUsersService, 'findOne')
        .mockRejectedValue(new Error(errorMessge));

      expect(controller.getUser(2, defaultUser)).rejects.toThrow(errorMessge);
    });
  });

  describe('updateUser', () => {
    //
  });

  describe('removeUser', () => {
    //
  });
});
