/**
 * User request DTOs
 */

import { Team, UserStatus, Role } from '../../types/user.types';

/**
 * Update user request interface
 */
export interface UpdateUserRequest {
  status?: UserStatus;
  email?: string;
  profilePicture?: string;
  linkedin?: string;
  github?: string;
  team?: Team;
  role?: Role[];
  applications?: any[]; // Application entities
}
