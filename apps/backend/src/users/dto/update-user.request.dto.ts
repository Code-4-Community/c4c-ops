import { Application } from '../../applications/application.entity';
import { UserStatus, Role, Team } from '@shared/types/user.types';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  IsUrl,
  IsObject,
} from 'class-validator';

export class UpdateUserRequestDTO {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
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

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  applications?: Application[];
}
