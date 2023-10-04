import { UnauthorizedException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

import { User } from './user.entity';
import { Status } from './types';
import { ObjectId } from 'mongodb';

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
}
