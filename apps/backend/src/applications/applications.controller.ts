import {
  Controller,
  Get,
  ParseIntPipe,
  Param,
  Request,
  UseInterceptors,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { SubmitApplicationDto } from './dto/submit-app.dto';

@Controller('apps')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  submitApplication(@Body() application: SubmitApplicationDto) {
    this.applicationsService.submitApp(application);
  }

  @Get('/:userId')
  getApplication(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.applicationsService.findOne(req.user, userId);
  }
}
