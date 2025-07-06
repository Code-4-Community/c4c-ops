import axios, { type AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Application,
  ApplicationRow,
  ApplicationStage,
  User,
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

export enum FileType {
  OVERVIEW = 'overview',
  APPLICATION = 'application',
  MATERIALS = 'materials',
  INTERVIEW_NOTES = 'interview_notes',
}

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

  public async getUser(accessToken: string): Promise<User> {
    return this.get('/api/users/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }) as Promise<User>;
  }

  /**
   * Downloads a file by type for a specific applicant
   *
   * @param accessToken - Authorization token
   * @param applicantId - ID of the applicant
   * @param fileType - Type of file to download
   */
  public async downloadFile(
    accessToken: string,
    applicantId: number,
    fileType: FileType,
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.get(
        `/api/file-upload/download/${applicantId}/${fileType}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let filename = `applicant_${fileType}.pdf`; // default fallback

      const contentDisposition =
        response.headers['content-disposition'] ||
        response.headers['Content-Disposition'];

      if (contentDisposition) {
        const matches = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '').trim();
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Gets available file types for a specific applicant
   *
   * @param accessToken - Authorization token
   * @param applicantId - ID of the applicant
   * @returns Array of available file types
   */
  public async getAvailableFileTypes(
    accessToken: string,
    applicantId: number,
  ): Promise<FileType[]> {
    try {
      const response = (await this.get(
        `/api/file-upload/available-types/${applicantId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )) as { availableTypes: FileType[] };
      return response.availableTypes;
    } catch (error) {
      console.error('Error getting available file types:', error);
      return [];
    }
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
