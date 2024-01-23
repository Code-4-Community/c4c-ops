import { Entity } from 'typeorm';
import { Role, Team, UserStatus } from '../types';

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
