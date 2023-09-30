import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Status } from './types';

import { User } from './user.entity';
import { UpdateUserDTO } from './users.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateUser(
    UpdateUserDTO: UpdateUserDTO,
    userId: string,
  ): Promise<User> {
    const id = new ObjectId(userId);

    const user: User = await this.usersRepository.findOne({
      where: {
        _id: { $eq: id },
      },
    });
    if (!user) {
      throw new BadRequestException(`Invalid user: ${userId}`);
    }

    const exampleUser: User = {
      id: new ObjectId('650f00d4f18cd8be2043e297'),
      status: Status.APPLICANT,
      firstName: 'jimmy',
      lastName: 'jimmy2',
      email: 'jimmy.jimmy2@mail.com',
      profilePicture: null,
      linkedin: null,
      github: null,
      team: null,
      role: null,
    };

    if (
      exampleUser.status === Status.APPLICANT &&
      userId != exampleUser.id.toString()
    ) {
      throw new BadRequestException(
        'Invalid update permissions; applicant cannot update another  applicant',
      );
    }

    if (
      (exampleUser.status === Status.MEMBER ||
        exampleUser.status === Status.ALUMNI) &&
      user.status == Status.APPLICANT
    ) {
      throw new BadRequestException(
        'Invalid update permissions; members and alumni cannot update applicants',
      );
    }

    if (
      exampleUser.status != Status.ADMIN &&
      userId != exampleUser.id.toString()
    ) {
      throw new UnauthorizedException();
    }

    await this.usersRepository.update(id, UpdateUserDTO);
    return await this.usersRepository.findOne({
      where: {
        _id: { $eq: id },
      },
    });
  }
}
