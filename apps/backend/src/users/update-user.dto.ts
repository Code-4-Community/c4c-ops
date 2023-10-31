import { Status, Role, Team } from './types';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  IsUrl,
} from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  profilePicture?: string;

  @IsOptional()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['www.linkedin.com'],
  })
  linkedin?: string;

  @IsOptional()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    host_whitelist: ['github.com'],
  })
  github?: string;

  @IsOptional()
  @IsEnum(Team)
  team?: Team;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  role?: Role[];
}
