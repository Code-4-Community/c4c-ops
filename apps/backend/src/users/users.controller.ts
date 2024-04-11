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
  Post,
} from '@nestjs/common';
import { UpdateUserRequestDTO } from './dto/update-user.request.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { GetUserResponseDto } from './dto/get-user.response.dto';
import { UserStatus } from './types';
import { toGetUserResponseDto } from './users.utils';

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

    return toGetUserResponseDto(user);
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

    return toGetUserResponseDto(newUser);
  }

  // TODO test this endpoint
  @Delete('/:userId')
  removeUser(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    if (req.user.status !== UserStatus.ADMIN && userId !== req.user.id) {
      throw new UnauthorizedException('Non-admins can only delete themselves');
    }

    return this.usersService.remove(req.user, userId);
  }

  @Post('email') // TODO: should not be a POST request, but AppScript is bugging out for GET requests
  findUserByEmail(@Body('email') email: string, @Request() req) {
    // TODO: email should be encoded and decoded here with a secret key
    if (req.user.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException();
    }
    return this.usersService.findByEmail(email);
  }
}
