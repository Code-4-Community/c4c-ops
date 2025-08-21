import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ApplicationsService } from '../applications/applications.service';
import { User } from '../users/user.entity';
import { SubmitReviewRequestDTO } from './dto/submit-review.request.dto';
import { UpdateReviewRequestDTO } from './dto/update-review.request.dto';

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

    const reviewerName = `${currentUser.firstName} ${currentUser.lastName}`;

    const review = this.reviewsRepository.create({
      reviewerName,
      createdAt: new Date(),
      updatedAt: new Date(),
      application,
      rating: createReviewDTO.rating,
      content: createReviewDTO.content,
      stage: createReviewDTO.stage,
    });

    return this.reviewsRepository.save(review);
  }

  async updateReview(
    reviewId: number,
    currentUser: User,
    updateDTO: UpdateReviewRequestDTO,
  ): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: ['application'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (
      review.reviewerName !==
      currentUser.firstName + ' ' + currentUser.lastName
    ) {
      throw new ForbiddenException('You are not allowed to edit this review');
    }

    review.rating = updateDTO.rating;
    review.content = updateDTO.content;
    review.updatedAt = new Date();

    return this.reviewsRepository.save(review);
  }

  async deleteReview(id: number): Promise<{ message: string }> {
    const review = await this.reviewsRepository.findOneBy({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.reviewsRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }
}
