import { Entity } from 'typeorm';
import { Role, Team } from '../types';

@Entity()
export class GetAllRecruitersResponseDTO {
  id: number;

  firstName: string;

  lastName: string;

  email: string;

  profilePicture: string | null;

  linkedin: string | null;

  github: string | null;

  team: Team | null;

  role: Role[] | null;
}
