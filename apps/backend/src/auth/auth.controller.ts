import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
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

@Controller('auth')
@UseInterceptors(CurrentUserInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/signup')
  async createUser(@Body() signUpDto: SignUpRequestDTO): Promise<User> {
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

  // TODO implement change/forgotPassword endpoint (service methods are already implemented)
  // But this won't be necessary if we use Google OAuth
  // https://dev.to/fstbraz/authentication-with-aws-cognito-passport-and-nestjs-part-iii-2da5

  @Post('/delete/:userId')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ): Promise<void> {
    const user = await this.usersService.findOne(req.user, userId);

    try {
      await this.authService.deleteUser(user.email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    this.usersService.remove(req.user, user.id);
  }
}
