import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserStatus } from './types';
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

    if (currentUser.status === UserStatus.APPLICANT) {
      throw new UnauthorizedException();
    }

    const users: User[] = await this.usersRepository.find({
      where: {
        status: { $not: { $eq: UserStatus.APPLICANT } },
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
      case UserStatus.ADMIN:
      case UserStatus.RECRUITER:
        break;
      //alumni and member can access all except for applicants
      case UserStatus.ALUMNI:
      case UserStatus.MEMBER:
        if (targetStatus == UserStatus.APPLICANT) {
          throw new UnauthorizedException('User not found');
        }
        break;
      //applicants can only access themselves
      case UserStatus.APPLICANT:
        if (currentUser.userId !== user.userId) {
          throw new UnauthorizedException('User not found');
        }
        break;
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

    if (
      currentUser.status !== UserStatus.ADMIN &&
      userId !== currentUser.userId
    ) {
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
