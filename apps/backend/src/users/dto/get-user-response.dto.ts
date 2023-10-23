import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { Role, Team, UserStatus } from '../types';

export class GetUserResponseDto {
  @IsNumber()
  userId: number;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  // TODO make custom decorator for @IsUrl()s
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  profilePicture: string | null;

  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['www.linkedin.com'],
  })
  linkedin: string | null;

  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['github.com'],
  })
  github: string | null;

  @IsEnum(Team)
  team: Team | null;

  @IsArray()
  @IsEnum(Role, { each: true })
  role: Role[] | null;
}
