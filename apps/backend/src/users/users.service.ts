import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

import { User } from './user.entity';
import { Status } from './types';
import { getCurrentUser } from './utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async findAll(getAllMembers: boolean): Promise<User[]> {
    if (!getAllMembers) return [];

    const exampleUser = getCurrentUser();

    if (exampleUser.status == Status.APPLICANT) {
      throw new UnauthorizedException();
    }

    const users: User[] = await this.usersRepository.find({
      where: {
        status: { $not: { $eq: Status.APPLICANT } },
      },
    });

    return users;
  }

  async findOne(userId: number) {
    const user = await this.usersRepository.findOneBy({ userId });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentUser = getCurrentUser();

    const currentStatus = currentUser.status;
    const targetStatus = user.status;

    switch (currentStatus) {
      //admin & recruiter can access all
      case Status.ADMIN:
      case Status.RECRUITER:
        break;
      //alumni and member can access all except for applicants
      case Status.ALUMNI:
      case Status.MEMBER:
        if (targetStatus == Status.APPLICANT) {
          throw new BadRequestException('User not found');
        }
        break;
      //applicants can only access themselves
      case Status.APPLICANT:
        if (currentUser.userId !== user.userId) {
          throw new BadRequestException('User not found');
        }
        break;
    }

    if (targetStatus !== Status.APPLICANT) {
      user.applications = [];
    }
    return user;
  }
}
