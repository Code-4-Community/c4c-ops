import {
  Controller,
  Get,
  ParseIntPipe,
  Param,
  Patch,
  Body,
  Post,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { ApplicationsService } from './applications.service';
import { ReviewApplicationDTO } from './dto/review-application.dto';

@Controller('apps')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('/:userId')
  getApplication(@Param('userId', ParseIntPipe) userId: number) {
    return this.applicationsService.findOne(userId);
  }

  @Post('/:userId')
  reviewApplication(
    @Body() reviewApplicationDTO: ReviewApplicationDTO,
    @Param('userId', ParseIntPipe) userId: number,
  ): void {
    this.applicationsService.reviewApplication(reviewApplicationDTO, userId);
  }
}
