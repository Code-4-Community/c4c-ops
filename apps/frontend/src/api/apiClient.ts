import axios, { type AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Application,
  ApplicationRow,
  ApplicationStage,
<<<<<<< HEAD
  User,
=======
  UserStatus,
>>>>>>> 6b25e52 (fixed delete button and added change status functionality)
} from '@components/types';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

type SubmitReviewRequest = {
  applicantId: number;
  stage: ApplicationStage;
  rating: number;
  content: string;
};

type DecisionRequest = { decision: 'ACCEPT' | 'REJECT' };

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: defaultBaseUrl });
  }

  public async getHello(): Promise<string> {
    return this.get('/api') as Promise<string>;
  }

  /**
   * sends code to backend to get user's access token
   *
   * @param code - code from cognito oauth
   * @returns access token
   */
  public async getToken(code: string): Promise<string> {
    const token = await this.get(`/api/auth/token/${code}`);
    return token as string;
  }

  public async getAllApplications(
    accessToken: string,
  ): Promise<ApplicationRow[]> {
    return (await this.get('/api/apps', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as Promise<ApplicationRow[]>;
  }

  public async getApplication(
    accessToken: string,
    userId: number,
  ): Promise<Application> {
    return (await this.get(`/api/apps/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as Promise<Application>;
  }

  public async deleteUser(accessToken: string, userId: number): Promise<void> {
    return this.delete(`/api/auth/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<void>;
  }

  public async getFullName(accessToken: string): Promise<string> {
    return (await this.get('/api/users/fullname', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as Promise<string>;
  }

  public async submitReview(
    accessToken: string,
    reviewData: SubmitReviewRequest,
  ): Promise<void> {
    return this.post('/api/reviews', reviewData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<void>;
  }

<<<<<<< HEAD
  public async getUser(accessToken: string): Promise<User> {
    return this.get('/api/users/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<User>;
=======
  public async updateUserStatus(
    accessToken: string,
    userId: number,
    newStatus: UserStatus,
  ): Promise<ApplicationRow> {
    const payload: Partial<ApplicationRow> = {
      status: newStatus,
    };
    return (await this.patch(`/api/users/${userId}`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as Promise<ApplicationRow>;
>>>>>>> 6b25e52 (fixed delete button and added change status functionality)
  }

  private async get(
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: AxiosRequestConfig<any> | undefined = undefined,
  ): Promise<unknown> {
    return this.axiosInstance
      .get(path, headers)
      .then((response) => response.data);
  }

  private async post(
    path: string,
    body: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: AxiosRequestConfig<any> | undefined = undefined,
  ): Promise<unknown> {
    return this.axiosInstance
      .post(path, body, headers)
      .then((response) => response.data);
  }

<<<<<<< HEAD
  private async postTwo(
    path: string,
    body: DecisionRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: AxiosRequestConfig<any> | undefined = undefined,
  ): Promise<unknown> {
    return this.axiosInstance
      .post(path, body, headers)
      .then((response) => response.data);
  }

  private async patch(path: string, body: unknown): Promise<unknown> {
=======
  private async patch(
    path: string,
    body: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: AxiosRequestConfig<any> | undefined = undefined,
  ): Promise<unknown> {
    console.log(`[API CLIENT] PATCH Request to: ${path}`);
    console.log('[API CLIENT] PATCH Request Body:', body);
    console.log(
      '[API CLIENT] PATCH Request Config received by patch method:',
      config,
    );

>>>>>>> 6b25e52 (fixed delete button and added change status functionality)
    return this.axiosInstance
      .patch(path, body, config)
      .then((response) => response.data);
  }

  private async delete(
    path: string,
    headers: AxiosRequestConfig<any> | undefined = undefined,
  ): Promise<unknown> {
    return this.axiosInstance
      .delete(path, headers)
      .then((response) => response.data);
  }
}

export default new ApiClient();
