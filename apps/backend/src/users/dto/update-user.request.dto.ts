import { Application } from '../../applications/application.entity';
import { UserStatus, Role, Team } from '../types';
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
import { IsEmailUnique } from '../email-unique.decorator';

export class UpdateUserRequestDTO {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEmail()
  @IsEmailUnique({ message: 'This email is already in use.' })
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
