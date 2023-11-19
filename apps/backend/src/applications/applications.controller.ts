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
  ParseArrayPipe,
  BadGatewayException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { SubmitApplicationDto } from './dto/submit-app.dto';
import { Response } from './types';

@Controller('apps')
@UseInterceptors(CurrentUserInterceptor)
// @UseGuards(AuthGuard('jwt'))
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async submitApplication(
    @Body('applicantId', ParseIntPipe) applicantId: number,
    @Body('application') application: string,
  ) {
    console.log(JSON.parse(application));
    console.log(application, applicantId);
    const submitApplicationDto: SubmitApplicationDto = {
      applicantId,
      application: JSON.parse(application),
    };
    await this.applicationsService.submitApp(submitApplicationDto);
  }

  @Get('/:userId')
  getApplication(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.applicationsService.findOne(req.user, userId);
  }
}
