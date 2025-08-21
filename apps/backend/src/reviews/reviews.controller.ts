import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
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
import { UpdateReviewRequestDTO } from './dto/update-review.request.dto';

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

    return this.reviewsService.createReview(req.user, createReviewDTO);
  }

  @Put(':id')
  async updateReview(
    @Param('id') id: number,
    @Body() updateDTO: UpdateReviewRequestDTO,
    @Request() req,
  ): Promise<Review> {
    return this.reviewsService.updateReview(id, req.user, updateDTO);
  }

  @Delete(':id')
  async deleteReview(
    @Param('id') id: number,
    @Request() req,
  ): Promise<{ message: string }> {
    if (req.user.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException('Only admins can delete reviews');
    }

    return this.reviewsService.deleteReview(id);
  }
}
