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
    const user: User = await this.findUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    try {
      await this.usersRepository.update({ id: userId }, updateUserDTO);
    } catch (e) {
      throw new BadRequestException('Cannot update user');
    }

    return await this.findUserById(userId);
  }

  async remove(currentUser: User, userId: number): Promise<User> {
    const user = await this.findUserById(userId);

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
