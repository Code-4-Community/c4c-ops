import {
  Controller,
  Get,
  ParseIntPipe,
  Param,
  Request,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { ApplicationDTO as GetApplicationDTO } from './dto/get-application.dto';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { getAppForCurrentCycle } from './utils';

@Controller('apps')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ApplicationsController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:userId')
  async getApplication(
    @Param('userId', ParseIntPipe) userId: number,
    // TODO: make req.user.applications unaccessible
    @Request() req,
  ): Promise<GetApplicationDTO> {
    const user = await this.usersService.findOne(req.user, userId);
    const app = getAppForCurrentCycle(user.applications);
    const appObject = instanceToPlain(app);
    if (appObject === null) {
      throw new BadRequestException(
        `There are no apps for the current cycle for the user with ID ${userId}`,
      );
    }
    appObject['numApps'] = user.applications.length;
    return plainToClass(GetApplicationDTO, appObject);
  }
}
