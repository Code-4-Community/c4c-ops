import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserRequestDTO } from './dto/update-user.request.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { GetUserResponseDto } from './dto/get-user.response.dto';
import { UserStatus } from './types';

@Controller('users')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:userId')
  async getUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ): Promise<GetUserResponseDto> {
    const user = await this.usersService.findOne(req.user, userId);

    return user.toGetUserResponseDto();
  }

  @Patch('/:userId')
  async updateUser(
    @Body() updateUserDTO: UpdateUserRequestDTO,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ): Promise<GetUserResponseDto> {
    if (req.user.status !== UserStatus.ADMIN && userId !== req.user.id) {
      throw new UnauthorizedException('Non-admins can only update themselves');
    }

    const newUser = await this.usersService.updateUser(
      req.user,
      userId,
      updateUserDTO,
    );

    return newUser.toGetUserResponseDto();
  }

  // TODO test this endpoint
  @Delete('/:userId')
  removeUser(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    if (req.user.status !== UserStatus.ADMIN && userId !== req.user.id) {
      throw new UnauthorizedException('Non-admins can only delete themselves');
    }

    return this.usersService.remove(req.user, userId);
  }
}
