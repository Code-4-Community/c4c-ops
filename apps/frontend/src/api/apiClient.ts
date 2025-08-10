import axios, { type AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Application,
  ApplicationRow,
  ApplicationStage,
  User,
  BackendApplicationDTO,
  AssignedRecruiter,
} from '@components/types';

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

type SubmitReviewRequest = {
  applicantId: number;
  stage: ApplicationStage;
  rating: number;
  content: string;
};

type DecisionRequest = {
  decision: 'ACCEPT' | 'REJECT';
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
    const rawData = (await this.get('/api/apps', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as BackendApplicationDTO[];

    return rawData.map((app, index) => ({
      id: index,
      userId: app.userId,
      name: app.firstName + ' ' + app.lastName,
      position: app.position,
      stage: app.stage,
      // If no reviews/ratings, set to null, else display
      rating:
        app.meanRatingAllReviews && app.meanRatingAllReviews > 0
          ? app.meanRatingAllReviews
          : null,
      createdAt: app.createdAt,
      // TODO: CHANGE ONCE THERE IS A BACKEND ENDPOINT FOR REVIEWED STAGE
      reviewed: app.meanRatingAllReviews ? 'Reviewed' : 'Unassigned',
      assignedTo: [],
      // Include detailed ratings for dropdown
      meanRatingAllReviews: app.meanRatingAllReviews,
      meanRatingResume: app.meanRatingResume,
      meanRatingChallenge: app.meanRatingChallenge,
      meanRatingTechnicalChallenge: app.meanRatingTechnicalChallenge,
      meanRatingInterview: app.meanRatingInterview,
    }));
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

  public async submitDecision(
    accessToken: string,
    applicationId: number,
    decisionRequest: DecisionRequest,
  ): Promise<void> {
    return this.post(`/api/apps/decision/${applicationId}`, decisionRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<void>;
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

  public async assignRecruiters(
    accessToken: string,
    applicationId: number,
    recruiterIds: number[],
  ): Promise<void> {
    return this.post(
      `/api/apps/assign-recruiters/${applicationId}`,
      {
        recruiterIds,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ) as Promise<void>;
  }

  public async getAssignedRecruiters(
    accessToken: string,
    applicationId: number,
  ): Promise<AssignedRecruiter[]> {
    return this.get(`/api/apps/assigned-recruiters/${applicationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as Promise<AssignedRecruiter[]>;
  }

  /**
   * Get all available recruiters
   * Used for assigned-to functionality
   *
   * @param accessToken The access token of the user (will be checked if admin by backend)
   * @returns All recruiters
   * @throws UnauthorizedException if user is not an admin
   */
  public async getAllRecruiters(
    accessToken: string,
  ): Promise<AssignedRecruiter[]> {
    return this.get('/api/users/recruiters', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as Promise<AssignedRecruiter[]>;
  }

  public async getUser(accessToken: string): Promise<User> {
    return this.get('/api/users/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<User>;
  }

  public async updateStage(
    accessToken: string,
    userId: number,
    stage: ApplicationStage,
  ): Promise<Application> {
    return this.put(
      `/api/apps/stage/${userId}`,
      { stage },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ) as Promise<Application>;
  }

  public async getUserById(accessToken: string, userId: number): Promise<User> {
    return this.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<User>;
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

  private async put(
    path: string,
    body: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: AxiosRequestConfig<any> | undefined = undefined,
  ): Promise<unknown> {
    return this.axiosInstance
      .put(path, body, headers)
      .then((response) => response.data);
  }

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
    return this.axiosInstance
      .patch(path, body)
      .then((response) => response.data);
  }

  private async delete(path: string): Promise<unknown> {
    return this.axiosInstance.delete(path).then((response) => response.data);
  }
}

export default new ApiClient();
