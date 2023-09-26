<<<<<<< HEAD
import {
  DefaultValuePipe,
  ParseBoolPipe,
  Query,
  Controller,
  Get,
} from '@nestjs/common';
=======
import { Controller, Get, Param } from '@nestjs/common';
>>>>>>> 99f1095 (worked on getUser method and user parameters)

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

  //TODO get method
  @Get('/:userId')
  getUser(@Param('userId') userId: string) {
    return this.usersService.findOne(parseInt(userId));
  }
}
