import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UserStatus } from '../users/types';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import { getAppForCurrentCycle } from './utils';
import { User } from '../users/user.entity';
import { ReviewApplicationDTO } from './dto/review-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: MongoRepository<Application>,
    private readonly usersService: UsersService,
  ) {}

  async findOne(currentUser: User, userId: number): Promise<Application> {
    switch (currentUser.status) {
      case UserStatus.ADMIN:
      case UserStatus.RECRUITER:
        break;
      default:
        if (currentUser.userId !== userId) {
          throw new UnauthorizedException(`User with ID ${userId} not found`);
        }
    }

    const applicant = await this.usersService.findOne(currentUser, userId);
    const currentApp = getAppForCurrentCycle(applicant.applications);
    if (currentApp == null) {
      throw new BadRequestException(
        "Applicant hasn't applied in the current cycle",
      );
    }

    return currentApp;
  }

  async reviewApplication(
    currentUser: User,
    reviewApplicationDTO: ReviewApplicationDTO,
    userId: number,
  ): Promise<void> {
    const review = reviewApplicationDTO.toReview();

    const applicant = await this.usersService.findOne(currentUser, userId);
    const currentApp = getAppForCurrentCycle(applicant.applications);
    currentApp.reviews.push(review);

    console.log(applicant.applications);

    await this.applicationsRepository.save(applicant.applications);
  }
}
