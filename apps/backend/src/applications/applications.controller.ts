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
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Decision, Response } from './types';
import { ApplicationsService } from './applications.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { GetApplicationResponseDTO } from './dto/get-application.response.dto';
import { getAppForCurrentCycle } from './utils';
import { UserStatus } from '../users/types';
import { Application } from './application.entity';
import { GetAllApplicationResponseDTO } from './dto/get-all-application.response.dto';

@Controller('apps')
@UseInterceptors(CurrentUserInterceptor)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async submitApplication(
    @Body('application') application: Response[],
    @Body('signature') signature: string,
    @Body('email') email: string,
  ): Promise<Application> {
    const user = await this.applicationsService.verifySignature(
      email,
      signature,
    );
    return await this.applicationsService.submitApp(application, user);
  }

  @Post('/decision/:appId')
  @UseGuards(AuthGuard('jwt'))
  async makeDecision(
    @Param('appId', ParseIntPipe) applicantId: number,
    @Body('decision') decision: Decision,
    @Request() req,
  ): Promise<void> {
    //Authorization check for admin and recruiters
    if (![UserStatus.ADMIN, UserStatus.RECRUITER].includes(req.user.status)) {
      throw new UnauthorizedException();
    }

    //Check if the string decision matches with the Decision enum
    const decisionEnum: Decision = Decision[decision];
    if (!decisionEnum) {
      throw new BadRequestException('Invalid decision value');
    }

    //Delegate the decision making to the service.
    await this.applicationsService.processDecision(applicantId, decisionEnum);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getApplications(
    @Request() req,
  ): Promise<GetAllApplicationResponseDTO[]> {
    if (
      !(
        req.user.status === UserStatus.RECRUITER ||
        req.user.status === UserStatus.ADMIN
      )
    ) {
      throw new UnauthorizedException(
        'Calling user is not a recruiter or admin.',
      );
    }
    return this.applicationsService.findAllCurrentApplications();
  }

  @Get('/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getApplication(
    @Param('userId', ParseIntPipe) userId: number,
    // TODO make req.user.applications unaccessible
    @Request() req,
  ): Promise<GetApplicationResponseDTO> {
    if (
      ![UserStatus.ADMIN, UserStatus.RECRUITER].includes(req.user.status) &&
      req.user.id !== userId
    ) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const apps = await this.applicationsService.findAll(userId);
    const app = getAppForCurrentCycle(apps);

    if (app == null) {
      throw new BadRequestException(
        `User with ID ${userId} hasn't applied this semester`,
      );
    }

    return app.toGetApplicationResponseDTO(apps.length);
  }
}
