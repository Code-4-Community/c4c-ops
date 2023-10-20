import {
  Query,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { UpdateUserDTO } from './update-user.dto';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Status } from './types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(
    @Query('status', new ParseEnumPipe(Status))
    targetStatus: Status,
  ) {
    return this.usersService.findAll(targetStatus);
  }

  @Patch(':userId')
  async updateUser(
    @Body() updateUserDTO: UpdateUserDTO,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<User> {
    return this.usersService.updateUser(updateUserDTO, userId);
  }
}
