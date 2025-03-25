import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { UsersService } from './users.service';
import { User } from './user.entity';
import { userFactory } from '../testing/factories/user.factory';
import { UserStatus } from './types';

const mockUsersRepository: Partial<Repository<User>> = {
  findOne: jest.fn(),
};

const member: User = userFactory({ id: 1, status: UserStatus.MEMBER });
const applicant: User = userFactory({ id: 2, status: UserStatus.APPLICANT });

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // TODO write specs
    // enough to just check that the correct repository methods have been called with the correct args
  });

  describe('findOne', () => {
    describe('When the calling user is a member', () => {
      it('finds the user with the given user ID', async () => {
        jest.spyOn(mockUsersRepository, 'findOne').mockResolvedValue(member);

        expect(await service.findOne(member, member.id)).toEqual(member);

        expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockUsersRepository.findOne).toHaveBeenCalledWith(
          expect.objectContaining({ where: { id: member.id } }),
        );
      });

      it("throws if user with the given ID doesn't exist", async () => {
        jest
          .spyOn(mockUsersRepository, 'findOne')
          .mockRejectedValue(new NotFoundException());

        await expect(service.findOne(member, -1)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('throws if trying to get an applicant', async () => {
        jest.spyOn(mockUsersRepository, 'findOne').mockResolvedValue(applicant);

        await expect(service.findOne(member, applicant.id)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('When the calling user is an admin', () => {
      //
    });
  });

  describe('findByEmail', () => {
    //
  });

  describe('updateUser', () => {
    //
  });

  describe('remove', () => {
    //
  });
});
