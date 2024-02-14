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
} from '@nestjs/common';
import { Response } from './types';
import { ApplicationsService } from './applications.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';
import { GetApplicationResponseDTO } from './dto/get-application.response.dto';
import { getAppForCurrentCycle } from './utils';
import { UserStatus } from '../users/types';

@Controller('apps')
@UseInterceptors(CurrentUserInterceptor)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async submitApplication(
    @Body('application') application: Response[],
    @Body('signature') signature: string,
    @Body('email') email: string,
  ): Promise<User> {
    const user = await this.applicationsService.verifySignature(
      email,
      signature,
    );
    return await this.applicationsService.submitApp(application, user);
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
