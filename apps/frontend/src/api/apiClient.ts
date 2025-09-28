import axios, { type AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Application,
  ApplicationRow,
  ApplicationStage,
  ReviewStatus,
  User,
  BackendApplicationDTO,
  AssignedRecruiter,
} from '@components/types';

/**
 * Token response type, used in getToken method, returns access_token and refresh_token now
 */
type TokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
};

/**
 * Stored tokens type for localStorage
 */
type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

// Simple token helper functions
const getStoredTokens = (): StoredTokens | null => {
  const stored = localStorage.getItem('auth_tokens');
  return stored ? JSON.parse(stored) : null;
};

const updateAccessToken = (newAccessToken: string): void => {
  const tokens = getStoredTokens();
  if (tokens) {
    const updated = { ...tokens, accessToken: newAccessToken };
    localStorage.setItem('auth_tokens', JSON.stringify(updated));
  }
};

/**
 * Simple function to refresh tokens when they expire
 * Call this when you get a 401 error
 */
const handleTokenRefresh = async (): Promise<string | null> => {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) {
    console.log('No refresh token available');
    return null;
  }

  try {
    // Use the refresh method from the API client instance
    const apiClientInstance = new ApiClient();
    const response = await apiClientInstance.refreshAccessToken(
      tokens.refreshToken,
    );

    // Update stored tokens with new access token
    updateAccessToken(response.accessToken);

    return response.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens if refresh fails
    localStorage.removeItem('auth_tokens');
    return null;
  }
};

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
    this.setupTokenRefreshInterceptor();
  }

  /**
   * Setup automatic token refresh when API calls return 401
   */
  private setupTokenRefreshInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response, // Pass through successful responses
      async (error) => {
        const originalRequest = error.config;

        // If we get 401 and haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Mark as retry to avoid infinite loops

          console.log('Access token expired, attempting refresh...');

          const newAccessToken = await handleTokenRefresh();

          if (newAccessToken) {
            // Update the authorization header with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            return this.axiosInstance(originalRequest);
          } else {
            // Refresh failed, redirect to login
            console.log('Token refresh failed, redirecting to login');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public async getHello(): Promise<string> {
    return this.get('/api') as Promise<string>;
  }

  /**
   * sends code to backend to get user's tokens (access + refresh)
   *
   * @param code - code from cognito oauth
   * @returns token response with access_token and refresh_token
   */
  public async getToken(code: string): Promise<TokenResponse> {
    const tokens = await this.get(`/api/auth/token/${code}`);
    return tokens as TokenResponse;
  }

  /**
   * Refreshes the access token using the refresh token
   *
   * Naman and Tarun
   * @param refreshToken - the refresh token from localStorage
   * @returns new access token
   */
  public async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const response = await this.post('/api/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response as { accessToken: string };
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
      review: app.reviewStatus,
      // If no reviews/ratings, set to null, else display
      rating:
        app.meanRatingAllReviews && app.meanRatingAllReviews > 0
          ? app.meanRatingAllReviews
          : null,
      createdAt: app.createdAt,
      // TODO: CHANGE ONCE THERE IS A BACKEND ENDPOINT FOR REVIEWED STAGE
      reviewed: app.meanRatingAllReviews ? 'Reviewed' : 'Unassigned',
      assignedTo: app.assignedRecruiters,
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

  public async updateReviewStatus(
    accessToken: string,
    userId: number,
    reviewStatus: ReviewStatus,
  ): Promise<Application> {
    return this.put(
      `/api/apps/review-status/${userId}`,
      { reviewStatus },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ) as Promise<Application>;
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

  public async uploadFile(
    accessToken: string,
    applicationId: number,
    file: File,
  ): Promise<{ message: string; fileId: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.axiosInstance
      .post(`/api/file-upload/${applicationId}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => response.data);
  }

  public async getUserById(accessToken: string, userId: number): Promise<User> {
    return this.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<User>;
  }

  public async getFiles(userId: number, accessToken: string): Promise<any> {
    return this.get(`/api/file-upload/user/${userId}?includeFileData=true`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<any>;
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

// Export the token refresh function for manual use
export { handleTokenRefresh, getStoredTokens };
