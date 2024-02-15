import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
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
    it('should return the user without their applications', async () => {
      jest.spyOn(mockUsersService, 'findOne').mockResolvedValue(defaultUser);

      expect(await controller.getUser(1, defaultUser)).toEqual(
        omit(defaultUser, 'applications'),
      );
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
    // endpoint updates user
    // catch invalid user id param
    // catch auth check fail
    // catch invalid request body
  });

  describe('removeUser', () => {
    // endpoint removes user
    // catch invalid user id param
    // catch auth check fail
  });
});
