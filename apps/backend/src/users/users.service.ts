import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDTO } from './update-user.dto';
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

    const currentUser = getCurrentUser();

    if (currentUser.status === Status.APPLICANT) {
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

  async updateUser(
    updateUserDTO: UpdateUserDTO,
    userId: number,
  ): Promise<User> {
    const user: User = await this.usersRepository.findOne({
      where: {
        userId: { $eq: userId },
      },
    });

    if (!user) {
      throw new BadRequestException(`User ${userId} not found.`);
    }

    const currentUser = getCurrentUser();

    if (currentUser.status !== Status.ADMIN && userId !== currentUser.userId) {
      throw new UnauthorizedException();
    }

    await this.usersRepository.update({ userId }, updateUserDTO);
    return await this.usersRepository.findOne({
      where: {
        userId: { $eq: userId },
      },
    });
  }
}
