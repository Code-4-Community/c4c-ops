import { Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import {
  AdminDeleteUserCommand,
  AttributeType,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import CognitoAuthConfig from './aws-exports';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignInResponseDto } from './dtos/sign-in-response.dto';

@Injectable()
export class AuthService {
  private readonly userPool: CognitoUserPool;
  private readonly providerClient: CognitoIdentityProviderClient;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: CognitoAuthConfig.userPoolId,
      ClientId: CognitoAuthConfig.clientId,
    });

    this.providerClient = new CognitoIdentityProviderClient({
      region: CognitoAuthConfig.region,
      credentials: {
        accessKeyId: process.env.NX_AWS_ACCESS_KEY,
        secretAccessKey: process.env.NX_AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getUser(userSub: string): Promise<AttributeType[]> {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Filter: `sub = "${userSub}"`,
    });

    // TODO need error handling
    const { Users } = await this.providerClient.send(listUsersCommand);
    return Users[0].Attributes;
  }

  signup({
    firstName,
    lastName,
    email,
    password,
  }: SignUpDto): Promise<ISignUpResult> {
    return new Promise((resolve, reject) => {
      return this.userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({
            Name: 'name',
            Value: `${firstName} ${lastName}`,
          }),
        ],
        null,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  }

  verifyUser(email: string, verificationCode: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return new CognitoUser({
        Username: email,
        Pool: this.userPool,
      }).confirmRegistration(verificationCode, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  signin({ email, password }: SignInDto): Promise<SignInResponseDto> {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise<SignInResponseDto>((resolve, reject) => {
      return cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  // TODO not currently used
  forgotPassword(email: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return new CognitoUser({
        Username: email,
        Pool: this.userPool,
      }).forgotPassword({
        onSuccess: function (result) {
          resolve(result);
        },
        onFailure: function (err) {
          reject(err);
        },
      });
    });
  }

  // TODO not currently used
  confirmPassword(
    email: string,
    verificationCode: string,
    newPassword: string,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return new CognitoUser({
        Username: email,
        Pool: this.userPool,
      }).confirmPassword(verificationCode, newPassword, {
        onSuccess: function (result) {
          resolve(result);
        },
        onFailure: function (err) {
          reject(err);
        },
      });
    });
  }

  async deleteUser(email: string): Promise<void> {
    const adminDeleteUserCommand = new AdminDeleteUserCommand({
      Username: email,
      UserPoolId: CognitoAuthConfig.userPoolId,
    });

    await this.providerClient.send(adminDeleteUserCommand);
  }
}
