import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { VerifyUserDto } from './dtos/verify-user.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';
import { User } from '../users/user.entity';
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@UseInterceptors(CurrentUserInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/signup')
  async createUser(@Body() signUpDto: SignUpDto): Promise<User> {
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

  // TODO deprecated if verification code is replaced by link
  @Post('/verify')
  verifyUser(@Body() body: VerifyUserDto): void {
    try {
      this.authService.verifyUser(body.email, String(body.verificationCode));
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/signin')
  signin(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signin(signInDto);
  }

  // TODO implement change/forgotPassword endpoint
  // https://dev.to/fstbraz/authentication-with-aws-cognito-passport-and-nestjs-part-iii-2da5

  @Post('/delete')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Body() body: DeleteUserDto, @Request() req): Promise<void> {
    const user = await this.usersService.findOne(req.user, body.userId);

    try {
      await this.authService.deleteUser(user.email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    this.usersService.remove(req.user, user.userId);
  }
}