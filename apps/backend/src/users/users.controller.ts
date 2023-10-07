import {
  DefaultValuePipe,
  ParseBoolPipe,
  Query,
  Controller,
  Get,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllMembers(
    @Query('getAllMembers', new DefaultValuePipe(false), ParseBoolPipe)
    AllMembers: boolean,
  ) {
    return this.usersService.findAll(AllMembers);
  }
}
