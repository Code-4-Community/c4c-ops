import {
  BadRequestException,
  Body,
  Controller,
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
import { VerifyUserRequestDTO } from './dtos/verify-user.request.dto';
import { User } from '../users/user.entity';
import { SignInResponseDto } from './dtos/sign-in.response.dto';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordRequestDto } from './dtos/forgot-password.request.dto';
import { ConfirmResetPasswordDto } from './dtos/confirm-reset-password.request.dto';
import { UserStatus } from '../users/types';

@Controller('auth')
@UseInterceptors(CurrentUserInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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

  // TODO will be deprecated if we use Google OAuth
  @Post('/verify')
  verifyUser(@Body() body: VerifyUserRequestDTO): void {
    try {
      this.authService.verifyUser(body.email, String(body.verificationCode));
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/signin')
  signin(@Body() signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    return this.authService.signin(signInDto);
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

  @Post('/forgotPassword')
  async forgotPassword(@Body() body: ForgotPasswordRequestDto) {
    try {
      await this.authService.forgotPassword(body.email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/confirmResetPassword')
  async confirmResetPassword(@Body() body: ConfirmResetPasswordDto) {
    try {
      await this.authService.confirmPassword(
        body.email,
        body.verificationCode,
        body.newPassword,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
