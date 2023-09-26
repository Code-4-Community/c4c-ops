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

    const exampleUser: User = {
      userId: new ObjectId('a0f3efa0f3efa0f3efa0f3ef'),
      status: Status.ADMIN,
      firstName: 'jimmy',
      lastName: 'jimmy2',
      email: 'jimmy.jimmy2@mail.com',
      profilePicture: null,
      linkedin: null,
      github: null,
      team: null,
      role: null,
    };

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
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentUser = getCurrentUser();

    const currentStatus = currentUser.status;
    const targetStatus = user.status;
    switch (currentStatus) {
      case Status.RECRUITER:
        if (targetStatus === Status.ADMIN) {
          throw new BadRequestException('User not found');
        }
        break;
      case Status.APPLICANT:
        if (currentUser.id !== user.id) {
          throw new BadRequestException('User not found');
        }
        break;
      case Status.MEMBER:
      case Status.ALUMNI:
        if (currentUser.status === Status.APPLICANT) {
          throw new BadRequestException('User not found');
        }
        break;
    }

    return user;
  }
}
