import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UserStatus } from '../users/types';
import { UsersService } from '../users/users.service';
import { getCurrentUser } from '../users/utils';
import { Application } from './application.entity';
import { getCurrentCycle } from './utils';
import { Cycle } from './dto/cycle.dto';
import { plainToClass } from 'class-transformer';
import { User } from '../users/user.entity';
import { ReviewApplicationDTO } from './dto/review-application.dto';
import { Review } from './types';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: MongoRepository<Application>,
    private readonly usersService: UsersService,
  ) {}

  async findOne(userId: number): Promise<Application> {
    const currentUser = getCurrentUser();
    const currentStatus = currentUser.status;
    switch (currentStatus) {
      case UserStatus.ADMIN:
      case UserStatus.RECRUITER:
        break;
      default:
        if (currentUser.userId !== userId) {
          throw new UnauthorizedException('User not found');
        }
        break;
    }

    const applicant = await this.usersService.findOne(userId);
    const application = applicant.applications[0];
    if (application == null) {
      throw new BadRequestException('Application not found');
    }

    const cycle = plainToClass(Cycle, application.cycle);

    //the user with the given userId has not applied in the current recruitment cycle
    if (!cycle.isCurrentCycle(getCurrentCycle())) {
      throw new BadRequestException(
        "Applicant hasn't applied in the current cycle",
      );
    }

    return application;
  }

  async reviewApplication(
    reviewApplicationDTO: ReviewApplicationDTO,
    userId: number,
  ): Promise<void> {
    const app = await this.findOne(userId);
    const review: Review = {
      reviewerId: reviewApplicationDTO.reviewerId,
      rating: reviewApplicationDTO.rating,
      summary: reviewApplicationDTO.summary,
    };

    app.reviews.push(review);

    //if this doesnt work- try update and update with just the review
    await this.applicationsRepository.save(app);

    //error handling
    //no user associated, throw exception
    //applicant tries to review, etc
    const currentUser = getCurrentUser();
    const currentStatus = currentUser.status;
    if (currentUser === null) {
      throw new UnauthorizedException('User not found');
    }
    if (currentStatus === UserStatus.APPLICANT) {
      throw new UnauthorizedException('User not found');
    }
  }
}
