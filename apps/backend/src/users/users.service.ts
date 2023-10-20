import {
  Injectable,
  BadRequestException,
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

  async findAll(targetStatus: Status): Promise<User[]> {
    const currentUser = getCurrentUser();

    if (
      (!currentUser.status || currentUser.status === Status.APPLICANT) &&
      (targetStatus === Status.ALUMNI || targetStatus === Status.APPLICANT)
    ) {
      throw new UnauthorizedException();
    }

    let users: User[];

    if (targetStatus !== Status.MEMBER) {
      users = await this.usersRepository.find({
        where: {
          status: { $eq: targetStatus },
        },
      });
    } else {
      users = await this.usersRepository.find({
        where: {
          $or: [
            { status: { $eq: Status.MEMBER } },
            { status: { $eq: Status.ADMIN } },
            { status: { $eq: Status.RECRUITER } },
          ],
        },
      });
    }

    return users;
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
