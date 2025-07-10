import { BadRequestException, Injectable } from '@nestjs/common';
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
import axios from 'axios';

import CognitoAuthConfig from './aws-exports';
import { SignUpRequestDTO } from './dtos/sign-up.request.dto';
import { SignInRequestDto } from './dtos/sign-in.request.dto';
import { SignInResponseDto } from './dtos/sign-in.response.dto';
import { TokenExchangeResponseDTO } from './dtos/token-exchange.response.dto';

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

  async getUserAttributes(userSub: string): Promise<AttributeType[]> {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Filter: `sub = "${userSub}"`,
    });

    const { Users } = await this.providerClient.send(listUsersCommand);
    if (Users.length === 0) {
      throw new BadRequestException('The given bearer token is invalid');
    }

    return Users[0].Attributes;
  }

  signup({
    firstName,
    lastName,
    email,
    password,
  }: SignUpRequestDTO): Promise<ISignUpResult> {
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
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: this.userPool,
      });

      return cognitoUser.confirmRegistration(
        verificationCode,
        true,
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

  signin({ email, password }: SignInRequestDto): Promise<SignInResponseDto> {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
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

  /**
   * exhanges the authorization code for authorization tokens
   * @see https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
   *
   * @param code - the authorization code granted by Cognito during the user's login
   */
  tokenExchange = async (code: string): Promise<string> => {
    const body = {
      grant_type: 'authorization_code',
      code,
      client_id: CognitoAuthConfig.clientId,
      redirect_uri: `${process.env.NX_CLIENT_URL}/login`,
    };

    const tokenExchangeEndpoint = `https://${CognitoAuthConfig.clientName}.auth.${CognitoAuthConfig.region}.amazoncognito.com/oauth2/token`;

    const urlEncodedBody = new URLSearchParams(body);

    const res = await axios
      .post(tokenExchangeEndpoint, urlEncodedBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .catch((err) => {
        console.error(
          'Cognito Token Fetch Error:',
          err.response?.data || err.message,
        );
        console.error('Full Error Details:', err.toJSON ? err.toJSON() : err);
        throw new Error(`Error while fetching tokens from cognito: ${err}`);
      });
    const tokens = res.data as TokenExchangeResponseDTO;
    return tokens.access_token;
  };
}
