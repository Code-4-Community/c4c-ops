import {
  Controller,
  Get,
  ParseIntPipe,
  Param,
  Request,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { ApplicationDTO } from './dto/application.dto';
import { classToPlain, instanceToPlain, plainToClass } from 'class-transformer';

@Controller('apps')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('/:userId')
  async getApplication(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ): Promise<ApplicationDTO> {
    const app = await this.applicationsService.findOne(req.user, userId);
    const appObject = instanceToPlain(app);
    // this is what i had orginally: appObject['numApps'] = this.applicationsService.getNumApps(req.user, userId)
    //but does this make more sense:
    appObject['numApps'] = app.application.length;
    return plainToClass(ApplicationDTO, appObject);
  }
}
