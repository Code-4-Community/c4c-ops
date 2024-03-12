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

  @Post('/decision')
  @UseGuards(AuthGuard('jwt'))
  async makeDecision(
    @Body('applicantId', ParseIntPipe) applicantId: number,
    @Body('decision') decision: 'ACCEPT' | 'REJECT',
    @Request() req,
  ): Promise<void> {
    //Authorization check for admin and recruiters
    if (![UserStatus.ADMIN, !UserStatus.RECRUITER].includes(req.user.status)) {
      throw new UnauthorizedException();
    }

    //Check if the string decision matches with the Decision enum
    const decisionEnum: Decision = Decision[decision as keyof typeof Decision];
    if (!decisionEnum) {
      throw new BadRequestException('Invalid decision value');
    }

    //Check if the user exists and if the user has an application for the current cycle
    const applicant = await this.applicationsService.findCurrent(applicantId);
    if (!applicant) {
      throw new NotFoundException(
        `Application for user with ID ${applicantId} not found or not for the current cycle`,
      );
    }

    //Delegate the decision making to the service.
    await this.applicationsService.processDecision(applicantId, decisionEnum);
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
