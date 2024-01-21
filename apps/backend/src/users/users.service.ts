import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserStatus } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async create(email: string, firstName: string, lastName: string) {
    const user = this.usersRepository.create({
      status: UserStatus.MEMBER,
      firstName,
      lastName,
      email,
    });

    return this.usersRepository.save(user);
  }

  async findAll(currentUser: User, getAllMembers: boolean): Promise<User[]> {
    if (!getAllMembers) return [];

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

  async findOne(currentUser: User, userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { userId },
      relations: ['applications'],
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

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
    currentUser: User,
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

  /* TODO merge these methods with the above methods */
  find(email: string) {
    return this.usersRepository.find({ where: { email } });
  }

  async update(currentUser: User, userId: number, attrs: Partial<User>) {
    const user = await this.findOne(currentUser, userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, attrs);

    return this.usersRepository.save(user);
  }

  async remove(currentUser: User, userId: number) {
    const user = await this.findOne(currentUser, userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.remove(user);
  }
  /* TODO merge these methods with the above methods */
}
