import {
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllMembers(
    @Query('getAllMembers', new DefaultValuePipe(false), ParseBoolPipe)
    getAllMembers: boolean,
  ) {
    return this.usersService.findAll(getAllMembers);
  }

  @Get('/:userId')
  getUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findOne(userId);
  }
}
