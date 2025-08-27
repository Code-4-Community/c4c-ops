import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { toGetUserResponseDto } from './users.utils';
import { User } from './user.entity';

@Controller('users')
@UseInterceptors(CurrentUserInterceptor)
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('email')
  async getUserByEmail(
    @Body('email') email: string,
    @Request() req,
  ): Promise<User[]> {
    // This endpoint is used by our Google Form AppScript to check whether a user already exists in our
    // database. If not, then the AppScript creates a new user. This is how the AppScript knows when to create a new user.
    if (req.user.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException();
    }
    return await this.usersService.findByEmail(email);
  }

  @Get('/fullname')
  async getFullName(@Request() req): Promise<string> {
    return `${req.user.firstName} ${req.user.lastName}`;
  }

  // To handle GET requests for all recruiters if the calling user is an admin
  @Get('/recruiters')
  async getRecruiters(@Request() req): Promise<User[]> {
    if (req.user.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException('Calling user is not an admin');
    }
    return this.usersService.findAllRecruiters();
  }

  @Get('/')
  async getRole(@Request() req) {
    console.log('user: ', req.user);
    if (
      req.user.status !== UserStatus.ADMIN &&
      req.user.status !== UserStatus.ALUMNI &&
      req.user.status !== UserStatus.APPLICANT &&
      req.user.status !== UserStatus.MEMBER &&
      req.user.status !== UserStatus.RECRUITER
    ) {
      throw new UnauthorizedException('Invalid role');
    }

    const user = await this.usersService.findOne(req.user, req.user.id);

    return toGetUserResponseDto(user);
  }

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
}
