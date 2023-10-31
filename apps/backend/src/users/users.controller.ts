import {
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { UpdateUserDTO } from './update-user.dto';
import { UsersService } from './users.service';
import { User } from './user.entity';

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

  @Patch(':userId')
  async updateUser(
    @Body() updateUserDTO: UpdateUserDTO,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<User> {
    return this.usersService.updateUser(updateUserDTO, userId);
  }
}
