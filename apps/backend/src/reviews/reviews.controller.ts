import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { SubmitReviewRequestDTO } from './dto/submit-review.request.dto';
import { UserStatus } from '../users/types';

@Controller('reviews')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async submitReview(
    @Body() createReviewDTO: SubmitReviewRequestDTO,
    @Request() req,
  ): Promise<Review> {
    if (![UserStatus.ADMIN, UserStatus.RECRUITER].includes(req.user.status)) {
      throw new UnauthorizedException(
        'Only admins and recruiters can review apps',
      );
    }

    return this.reviewsService.createReview(
      req.user,
      createReviewDTO.applicantId,
      createReviewDTO.rating,
      createReviewDTO.content,
    );
  }
}
