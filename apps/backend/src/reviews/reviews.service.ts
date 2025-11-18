import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ApplicationsService } from '../applications/applications.service';
import { User } from '../users/user.entity';
import { SubmitReviewRequestDTO } from './dto/submit-review.request.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private applicationsService: ApplicationsService,
  ) {}

  /**
   * Add a review to an application
   */
  async createReview(
    currentUser: User,
    createReviewDTO: SubmitReviewRequestDTO,
  ): Promise<Review> {
    this.logger.debug(
      `User ${currentUser.id} submitting review for applicant ${createReviewDTO.applicantId} at stage ${createReviewDTO.stage}`,
    );
    const application = await this.applicationsService.findCurrent(
      createReviewDTO.applicantId,
    );
    this.logger.debug(
      `Resolved current application ${application.id} for applicant ${createReviewDTO.applicantId}`,
    );

    const review = this.reviewsRepository.create({
      reviewerId: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      application,
      rating: createReviewDTO.rating,
      content: createReviewDTO.content,
      stage: createReviewDTO.stage,
    });

    const savedReview = await this.reviewsRepository.save(review);
    this.logger.debug(
      `Review ${savedReview.id} saved for applicant ${createReviewDTO.applicantId}`,
    );
    return savedReview;
  }
}
