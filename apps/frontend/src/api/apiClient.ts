import axios, { type AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Application,
  ApplicationRow,
  ApplicationStage,
} from '@components/types';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

type SubmitReviewRequest = {
  applicantId: number;
  stage: ApplicationStage;
  rating: number;
  content: string;
};

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

  // check this code later mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
  /*
  public async changeStage(
    accessToken: string,
    userId: number,
  ): Promise<ApplicationStage> {
    return (await this.post(`/api/decision/${userId}`, {}, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
      },
    })) as Promise<ApplicationStage>;
  } */
  /////////////////////////////////////////////////////////////////////////////////////////////

  public async changeStage(
    accessToken: string,
    userId: number,
  ): Promise<Application> {
    // Fetch the current application to get its stage
    const application = await this.getApplication(accessToken, userId);
    const currentStage = application.stage; // This is just a string now

    console.log(`Current stage for userId ${userId}: ${currentStage}`);

    // Determine the next stage using string comparison
    let nextStage = 'REJECTED'; // Default action
    if (currentStage === 'RESUME') nextStage = 'INTERVIEW';
    else if (currentStage === 'INTERVIEW') nextStage = 'TECHNICAL_CHALLENGE';
    else if (currentStage === 'TECHNICAL_CHALLENGE') nextStage = 'PM_CHALLENGE';
    else if (currentStage === 'PM_CHALLENGE') nextStage = 'ACCEPTED';

    console.log(`Changing stage for userId ${userId} to ${nextStage}`);

    // Call the API to update the stage
    return (await this.post(
      `/api/decision/${userId}`,
      { stage: nextStage },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )) as Promise<Application>;
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

  private async patch(path: string, body: unknown): Promise<unknown> {
    return this.axiosInstance
      .patch(path, body)
      .then((response) => response.data);
  }

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }
}

export default new ApiClient();
