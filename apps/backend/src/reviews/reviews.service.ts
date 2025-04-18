import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ApplicationsService } from '../applications/applications.service';
import { User } from '../users/user.entity';
import { SubmitReviewRequestDTO } from './dto/submit-review.request.dto';

@Injectable()
export class ReviewsService {
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
    const application = await this.applicationsService.findCurrent(
      createReviewDTO.applicantId,
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

    return this.reviewsRepository.save(review);
  }
}
