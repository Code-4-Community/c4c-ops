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
    @Body('application') application: string,
    @Body('signature') signature: string,
    @Body('email') email: string,
  ) {
    const user = await this.applicationsService.verifySignature(
      email,
      signature,
    );
    await this.applicationsService.submitApp(JSON.parse(application), user);
  }

  @Get('/:userId')
  getApplication(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.applicationsService.findOne(req.user, userId);
  }
}
