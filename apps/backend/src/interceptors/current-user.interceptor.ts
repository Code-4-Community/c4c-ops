import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { UpdatedAttributeType } from '../auth/auth.utils';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    if (request.user?.idUser != null) {
      // Fetch both username and attributes from Cognito
      const {
        username,
        attributes: cognitoUserAttributes,
      }: UpdatedAttributeType = await this.authService.getUserAttributes(
        request.user.idUser,
      );

      // Retrieve name and email
      const userEmail = cognitoUserAttributes.find(
        (attr) => attr.Name === 'email',
      )?.Value;
      const fullName = cognitoUserAttributes.find(
        (attr) => attr.Name === 'name',
      )?.Value;

      // Validates that both the email and name are found
      if (!userEmail || !fullName) {
        throw new Error('Required Cognito attributes not found');
      }

      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.at(-1) : '';

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
      request.username = username;
    }

    return handler.handle();
  }
}
