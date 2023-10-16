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
      //admin can access all users
      case Status.ADMIN:
        break;
      //recruiter can access applicant, and themselves
      case Status.RECRUITER:
        if (targetStatus == Status.APPLICANT) {
          break;
        } else if (currentUser.userId !== user.userId) {
          throw new BadRequestException('User not found');
        }
        break;
      //everyone else can only access themselves
      default:
        if (currentUser.userId !== user.userId) {
          throw new BadRequestException('User not found');
        }
    }

    return user;
  }
}
