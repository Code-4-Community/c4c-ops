import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserRequestDTO } from './dto/update-user.request.dto';
import { UserStatus } from '@shared/types/user.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const user = this.usersRepository.create({
      status: UserStatus.MEMBER,
      firstName,
      lastName,
      email,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Finds a user by their id.
   * @param id the id of the user.
   * @returns the user.
   */
  async findUserById(id: number): Promise<User> {
    const user: User = await this.usersRepository.findOne({
      where: { id },
      relations: ['applications'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // TODO refactor method to not take in currentUser
  async findOne(currentUser: User, userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['applications'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const currentStatus = currentUser.status;
    const targetStatus = user.status;

    switch (currentStatus) {
      // Admins and recruiters can access all users
      case UserStatus.ADMIN:
      case UserStatus.RECRUITER:
        break;
      // Alumni and members can access all users except for applicants
      case UserStatus.ALUMNI:
      case UserStatus.MEMBER:
        if (targetStatus === UserStatus.APPLICANT) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        break;
      // Applicants can access all users except for applications that are not their own
      case UserStatus.APPLICANT:
        if (
          targetStatus === UserStatus.APPLICANT &&
          currentUser.id !== user.id
        ) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        break;
    }

    return user;
  }

  async findByEmail(email: string): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: { email },
      relations: ['applications'],
    });
    return users;
  }

  async updateUser(
    currentUser: User,
    userId: number,
    updateUserDTO: UpdateUserRequestDTO,
  ): Promise<User> {
    const user: User = await this.findOne(currentUser, userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    try {
      await this.usersRepository.update({ id: userId }, updateUserDTO);
    } catch (e) {
      throw new BadRequestException('Cannot update user');
    }

    return await this.findOne(currentUser, userId);
  }

  async remove(currentUser: User, userId: number): Promise<User> {
    const user = await this.findOne(currentUser, userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.usersRepository.remove(user);
  }

  // To find and return all users with a user status of "Recruiter"
  async findAllRecruiters(): Promise<User[]> {
    const recruiters = await this.usersRepository.find({
      where: {
        status: UserStatus.RECRUITER,
      },
    });
    return recruiters;
  }
}
