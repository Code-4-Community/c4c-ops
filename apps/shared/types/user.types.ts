/**
 * User-related types and enums
 * These are shared between frontend and backend
 */

/**
 * User status levels
 */
export enum UserStatus {
  MEMBER = 'Member',
  RECRUITER = 'Recruiter',
  ADMIN = 'Admin',
  ALUMNI = 'Alumni',
  APPLICANT = 'Applicant',
}

/**
 * Team assignments
 */
export enum Team {
  SFTT = 'Speak for the Trees',
  CONSTELLATION = 'Constellation',
  JPAL = 'J-PAL',
  BREAKTIME = 'Breaktime',
  GI = 'Green Infrastructure',
  CI = 'Core Infrastructure',
  EBOARD = 'E-Board',
}

/**
 * User roles within the organization
 */
export enum Role {
  DEVELOPER = 'Developer',
  PM = 'Product Manager',
  DESIGNER = 'Designer',
}

/**
 * Main User interface
 */
export interface User {
  id: number;
  status: UserStatus | null;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  linkedin: string | null;
  github: string | null;
  team: Team | null;
  role: Role[] | null;
}
