import { Entity } from 'typeorm';
import { Role, Team, UserStatus } from '../types';

// TODO: Update this DTO and toGetUserResponseDto to include 'recruiters' field
@Entity()
export class GetUserResponseDto {
  id: number;

  status: UserStatus;

  firstName: string;

  lastName: string;

  email: string;

  profilePicture: string | null;

  linkedin: string | null;

  github: string | null;

  team: Team | null;

  role: Role[] | null;
}
