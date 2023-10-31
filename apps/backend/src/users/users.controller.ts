import {
  Query,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseEnumPipe,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { UserStatus } from './types';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Controller('users')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers(
    @Query('status', new ParseEnumPipe(UserStatus))
    targetStatus: UserStatus,
    @Request() req,
  ) {
    return this.usersService.findAll(req.user, targetStatus);
  }

  @Get('/:userId')
  getUser(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    return this.usersService.findOne(req.user, userId);
  }

  @Patch(':userId')
  async updateUser(
    @Body() updateUserDTO: UpdateUserDTO,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ): Promise<User> {
    return this.usersService.updateUser(req.user, updateUserDTO, userId);
  }

  @Delete('/:userId')
  removeUser(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    // TODO add authentication
    return this.usersService.remove(req.user, userId);
  }
}
