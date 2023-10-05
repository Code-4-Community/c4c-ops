import { Controller, Get, ParseIntPipe, Param } from '@nestjs/common';

import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('/:userId')
  getUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.applicationsService.findOne(userId);
  }
}
