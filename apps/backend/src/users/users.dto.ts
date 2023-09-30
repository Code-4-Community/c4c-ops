import { Status } from './types';

export class UpdateUserDTO {
  status?: Status;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  linkedIn?: string;
  github?: string;
  team?: string;
  role?: string;
}
