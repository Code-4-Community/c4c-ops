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
  Put,
} from '@nestjs/common';
import { ApplicationStage, Decision, Response, ReviewStage } from './types';
import { ApplicationsService } from './applications.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import {
  AssignedRecruiterDTO,
  GetApplicationResponseDTO,
} from './dto/get-application.response.dto';
import { getAppForCurrentCycle } from './utils';
import { UserStatus } from '../users/types';
import { Application } from './application.entity';
import { GetAllApplicationResponseDTO } from './dto/get-all-application.response.dto';
import { AssignRecruitersRequestDTO } from './dto/assign-recruiters.request.dto';

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
    return this.applicationsService.findAllCurrentApplications(req.user);
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
    // Get all applications for the specific user
    let apps = [];
    // If recruiter, only allow access if assigned to this application
    if (req.user.status === UserStatus.ADMIN) {
      apps = await this.applicationsService.findAll(userId);
    } else if (req.user.status === UserStatus.RECRUITER) {
      apps = await this.applicationsService.findAll(userId);
      apps = apps.filter((app) =>
        app.assignedRecruiterIds.includes(req.user.id),
      );
    } else {
      apps = await this.applicationsService.findAll(userId);
    }

    const app = getAppForCurrentCycle(apps);

    if (app == null) {
      throw new BadRequestException(
        `User with ID ${userId} hasn't applied this semester or you don't have access to their application`,
      );
    }

    let applicationStep: ReviewStage = null;

    // The application step
    if (app.reviews.length > 0) {
      applicationStep = ReviewStage.REVIEWED;
    } else {
      applicationStep = ReviewStage.SUBMITTED;
    }

    // Get assigned recruiters for this application (only for admins and recruiters)
    // TODO: make this more generic for other roles
    let assignedRecruiters = [];
    if (
      req.user.status === UserStatus.ADMIN ||
      req.user.status === UserStatus.RECRUITER
    ) {
      assignedRecruiters = await this.applicationsService.getAssignedRecruiters(
        app.id,
        req.user,
      );
    } else {
      assignedRecruiters = [];
    }

    return app.toGetApplicationResponseDTO(
      apps.length,
      applicationStep,
      assignedRecruiters,
    );
  }

  @Post('/assign-recruiters/:appId')
  @UseGuards(AuthGuard('jwt'))
  async assignRecruitersToApplication(
    @Param('appId', ParseIntPipe) applicationId: number,
    @Body() assignRecruitersDTO: AssignRecruitersRequestDTO,
    @Request() req,
  ): Promise<void> {
    // Authorization check for admin only
    if (req.user.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException(
        'Only admins can assign recruiters to applications',
      );
    }

    await this.applicationsService.assignRecruitersToApplication(
      applicationId,
      assignRecruitersDTO.recruiterIds,
      req.user,
    );
  }

  @Get('/assigned-recruiters/:appId')
  @UseGuards(AuthGuard('jwt'))
  async getAssignedRecruiters(
    @Param('appId', ParseIntPipe) applicationId: number,
    @Request() req,
  ): Promise<AssignedRecruiterDTO[]> {
    const assignedRecruiters =
      await this.applicationsService.getAssignedRecruiters(
        applicationId,
        req.user,
      );

    return assignedRecruiters;
  }

  @Put('/stage/:userId')
  @UseGuards(AuthGuard('jwt'))
  async updateStage(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('stage') stage: ApplicationStage,
    @Request() req,
  ): Promise<Application> {
    if (![UserStatus.ADMIN, UserStatus.RECRUITER].includes(req.user.status)) {
      throw new UnauthorizedException();
    }

    const stageEnum: ReviewStage = ApplicationStage[stage];
    if (!Object.values(ApplicationStage).includes(stage)) {
      throw new BadRequestException('Invalid stage value');
    }
    return await this.applicationsService.updateStage(userId, stage);
  }
}
