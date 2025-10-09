import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from './auth.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the AWS Cognito modules
jest.mock('amazon-cognito-identity-js', () => ({
  CognitoUserPool: jest.fn().mockImplementation(() => ({})),
  CognitoUser: jest.fn(),
  AuthenticationDetails: jest.fn(),
  CognitoUserAttribute: jest.fn(),
}));

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  AdminDeleteUserCommand: jest.fn(),
  ListUsersCommand: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Set required environment variables
    process.env.NX_AWS_ACCESS_KEY = 'test-access-key';
    process.env.NX_AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.NX_CLIENT_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockAccessToken = 'new-access-token';

    describe('Success Cases', () => {
      it('should successfully refresh token and return new access token', async () => {
        const mockResponse = {
          data: {
            access_token: mockAccessToken,
            id_token: 'new-id-token',
            token_type: 'Bearer',
            expires_in: 3600,
          },
        };

        mockedAxios.post.mockResolvedValue(mockResponse);

        const result = await service.refreshToken(mockRefreshToken);

        expect(result).toEqual({ accessToken: mockAccessToken });
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/oauth2/token'),
          expect.any(URLSearchParams),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        // Verify the request body contains correct parameters
        const callArgs = mockedAxios.post.mock.calls[0];
        const bodyParams = callArgs[1] as URLSearchParams;
        expect(bodyParams.get('grant_type')).toBe('refresh_token');
        expect(bodyParams.get('refresh_token')).toBe(mockRefreshToken);
        expect(bodyParams.get('client_id')).toBeDefined();
      });
    });

    describe('Error Cases - Invalid or Expired Token', () => {
      it('should throw BadRequestException when error code is "invalid_grant"', async () => {
        const mockError = {
          response: {
            data: {
              error: 'invalid_grant',
              error_description: 'Refresh Token has been revoked',
            },
            status: 400,
          },
          message: 'Request failed with status code 400',
          toJSON: () => ({ message: 'error' }),
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          'Invalid or expired refresh token',
        );
      });

      it('should throw BadRequestException when error description contains "invalid"', async () => {
        const mockError = {
          response: {
            data: {
              error: 'some_error',
              error_description: 'Invalid refresh token provided',
            },
            status: 400,
          },
          message: 'Request failed',
          toJSON: () => ({ message: 'error' }),
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          'Invalid or expired refresh token',
        );
      });

      it('should throw BadRequestException when status is 400', async () => {
        const mockError = {
          response: {
            data: {
              error: 'bad_request',
            },
            status: 400,
          },
          message: 'Bad Request',
          toJSON: () => ({ message: 'error' }),
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          'Invalid or expired refresh token',
        );
      });

      it('should throw BadRequestException when error description contains "Invalid" with capital I', async () => {
        const mockError = {
          response: {
            data: {
              error: 'token_error',
              error_description: 'Invalid token signature',
            },
            status: 401,
          },
          message: 'Unauthorized',
          toJSON: () => ({ message: 'error' }),
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          'Invalid or expired refresh token',
        );
      });
    });

    describe('Error Cases - Generic Errors', () => {
      it('should throw BadRequestException with custom message for network errors', async () => {
        const mockError = {
          response: {
            data: { error: 'network_error' },
            status: 500,
          },
          message: 'Network Error',
          toJSON: () => ({ message: 'Network Error' }),
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          'Error while refreshing tokens from cognito: Network Error',
        );
      });

      it('should throw BadRequestException when error has no response', async () => {
        const mockError = {
          message: 'Connection timeout',
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          'Error while refreshing tokens from cognito: Connection timeout',
        );
      });

      it('should handle error without message property', async () => {
        const mockError = {
          response: {
            data: { error: 'unknown_error' },
            status: 503,
          },
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('Console Error Logging', () => {
      let consoleErrorSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation(() => undefined);
      });

      afterEach(() => {
        consoleErrorSpy.mockRestore();
      });

      it('should log error details when token refresh fails', async () => {
        const mockError = {
          response: {
            data: {
              error: 'invalid_grant',
              error_description: 'Token expired',
            },
            status: 400,
          },
          message: 'Token refresh failed',
          toJSON: () => ({ message: 'Token refresh failed', code: 400 }),
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Cognito Token Refresh Error:',
          mockError.response.data,
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Full Error Details:',
          mockError.toJSON(),
        );
      });

      it('should log error message when response data is not available', async () => {
        const mockError = {
          message: 'Network failure',
        };

        mockedAxios.post.mockRejectedValue(mockError);

        await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
          BadRequestException,
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Cognito Token Refresh Error:',
          mockError.message,
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Full Error Details:',
          mockError,
        );
      });
    });
  });
});
