import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDTO } from './update-user.dto';
import { ObjectId } from 'mongodb';
import { Status } from './types';

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

  async updateUser(
    updateUserDTO: UpdateUserDTO,
    userId: string,
  ): Promise<User> {
    let id: ObjectId;
    try {
      id = new ObjectId(userId);
    } catch (err) {
      //TODO maybe check for other errors that might be thrown in line 31
      //right now this assumes that the error is a BSONError when an id is passed in that's not a 24 character hex
      throw new BadRequestException(
        'Invalid user ID format. UserID must be a 24 character hex string, 12 byte Uint8Array, or an integer',
      );
    }

    const user: User = await this.usersRepository.findOne({
      where: {
        _id: { $eq: id },
      },
    });

    if (!user) {
      throw new BadRequestException(`User ${userId} not found.`);
    }

    const exampleUser: User = {
      userId: new ObjectId('650f00d4f18cd8be2043e297'),
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

    if (
      exampleUser.status === Status.APPLICANT &&
      userId !== exampleUser.userId.toString()
    ) {
      throw new BadRequestException(
        'Invalid update permissions; applicant cannot update another applicant',
      );
    }

    if (
      (exampleUser.status === Status.MEMBER ||
        exampleUser.status === Status.ALUMNI) &&
      user.status === Status.APPLICANT
    ) {
      throw new BadRequestException(
        'Invalid update permissions; members and alumni cannot update applicants',
      );
    }

    if (
      exampleUser.status !== Status.ADMIN &&
      userId !== exampleUser.userId.toString()
    ) {
      throw new UnauthorizedException();
    }

    await this.usersRepository.update(id, updateUserDTO);
    return await this.usersRepository.findOne({
      where: {
        _id: { $eq: id },
      },
    });
  }
}
