import { Controller, Get, ParseIntPipe, Param } from '@nestjs/common';
import { UsersService } from '../users/users.service';

import { ApplicationsService } from './applications.service';

@Controller('apps')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('/:userId')
  getApplication(@Param('userId', ParseIntPipe) userId: number) {
    return this.applicationsService.findOne(userId);
  }
}
