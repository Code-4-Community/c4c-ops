import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { Status } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(getAllMembers: boolean): Promise<User[]> {
    if (!getAllMembers) return [];

    const exampleUser: User = {
      userId: 1,
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

    const users: User[] = await this.usersRepository.find();

    //TODO possibly use an interceptor instead here
    users.forEach((user: User) => {
      if (user.status == Status.APPLICANT) {
        throw new BadRequestException();
      }
    });

    return users;
  }
}
