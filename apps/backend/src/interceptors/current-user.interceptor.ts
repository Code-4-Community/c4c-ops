import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    if (request.user?.idUser != null) {
      const cognitoUserAttributes = await this.authService.getUserAttributes(
        request.user.idUser,
      );
      const userEmail = cognitoUserAttributes.find(
        (attribute) => attribute.Name === 'email',
      ).Value;
      const name = cognitoUserAttributes
        .find((attribute) => attribute.Name === 'name')
        .Value.split(' ');

      const [firstName, lastName] = [name[0], name.at(-1)];

      // check if the cognito user has a corresponding user in the database
      const users = await this.usersService.findByEmail(userEmail);
      let user = null;
      if (users.length > 0) {
        // if the user exists, use the user from the database
        user = users[0];
      } else {
        // if the user does not exist, create a new user in the database
        user = await this.usersService.create(userEmail, firstName, lastName);
      }
      request.user = user;
    }

    return handler.handle();
  }
}
