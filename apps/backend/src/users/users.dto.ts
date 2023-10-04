import { Status, Role, Team } from './types';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
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
  linkedIn?: string;

  @IsOptional()
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
