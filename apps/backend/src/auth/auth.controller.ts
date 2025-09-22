import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { SignInRequestDto } from './dtos/sign-in.request.dto';
import { SignUpRequestDTO } from './dtos/sign-up.request.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { SignInResponseDto } from '../../../shared/dto/auth.dto';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { UserStatus } from '../../../shared/types/user.types';

@Controller('auth')
@UseInterceptors(CurrentUserInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  /**
   * Used by Google Form script
   * @param signUpDto
   */
  @Post('/signup')
  async createUser(@Body() signUpDto: SignUpRequestDTO): Promise<User> {
    //Regular expression to validate the email domain
    const domainRegex = /@(northeastern\.edu|husky\.neu\.edu)$/;

    //Check if the email domain is valid
    if (!domainRegex.test(signUpDto.email)) {
      throw new BadRequestException(
        'Invalid email domain. Only northeastern.edu and husky.neu.edu domains are allowed.',
      );
    }

    try {
      await this.authService.signup(signUpDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    const user = await this.usersService.create(
      signUpDto.email,
      signUpDto.firstName,
      signUpDto.lastName,
    );

    return user;
  }

  /**
   * Used by Google Forms script for c4c admin login to create a new user
   * @param signInDto
   */
  @Post('/signin')
  async signin(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    return await this.authService.signin(signInDto).catch((err) => {
      throw new UnauthorizedException(err.message);
    });
  }

  @Post('/delete/:userId')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ): Promise<void> {
    const user = await this.usersService.findOne(req.user, userId);

    if (user.id !== userId && user.status !== UserStatus.ADMIN) {
      throw new UnauthorizedException();
    }

    try {
      await this.authService.deleteUser(user.email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    this.usersService.remove(req.user, user.id);
  }

  @Get('/token/:code')
  async grantAccessToken(@Request() req) {
    const { code } = req.params;
    return await this.authService.tokenExchange(code);
  }
}
