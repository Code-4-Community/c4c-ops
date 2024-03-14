import { Test, TestingModule } from '@nestjs/testing';
import { omit } from 'lodash';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { userFactory } from '../testing/factories/user.factory';
import { UsersService } from '../users/users.service';

const mockAuthService: Partial<AuthService> = {
  signup: jest.fn(),
};

const mockUsersService: Partial<UsersService> = {
  create: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        // {
        //   provide: getRepositoryToken(User),
        //   useValue: {},
        // },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should add a new user with either northeastern.edu or husky.neu.edu email', async () => {
      jest.spyOn(mockAuthService, 'signup').mockResolvedValue(undefined);

      await expect(
        controller.createUser({
          firstName: 'Ahnaf',
          lastName: 'Inkiad',
          email: 'inkiad.a@northeastern.edu',
          password: 'Password1!',
        }),
      ).resolves.not.toThrow(
        'Invalid email domain. Only northeastern.edu and husky.neu.edu domains are allowed.',
      );
    });

    describe('signUp', () => {
      it('should throw an error because of not having northeastern.edu or husky.neu.edu email', async () => {
        jest.spyOn(mockAuthService, 'signup').mockResolvedValue(undefined);

        await expect(
          controller.createUser({
            firstName: 'Ahnaf',
            lastName: 'Inkiad',
            email: 'inkiad.a@nnnnortheastern.edu',
            password: 'Password1!',
          }),
        ).rejects.toThrow(
          'Invalid email domain. Only northeastern.edu and husky.neu.edu domains are allowed.',
        );
      });
    });

    // it("should throw an error if the user can't be found", async () => {
    //   const errorMessge = 'Cannot find user';

    //   jest
    //     .spyOn(mockUsersService, 'findOne')
    //     .mockRejectedValue(new Error(errorMessge));

    //   expect(controller.getUser(2, defaultUser)).rejects.toThrow(errorMessge);
    // });
  });
});
