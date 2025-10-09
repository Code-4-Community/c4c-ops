import {
  IsPositive,
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Role, Team, UserStatus } from '@shared/types/user.types';
import { GetUserResponse } from '@shared/dto/response/user.dto';

/**
 * Get user response DTO
 */
export class GetUserResponseDto implements GetUserResponse {
  @IsPositive()
  id: number;

  @IsEnum(UserStatus)
  @IsOptional()
  status: UserStatus | null;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsUrl()
  @IsOptional()
  profilePicture: string | null;

  @IsUrl()
  @IsOptional()
  linkedin: string | null;

  @IsUrl()
  @IsOptional()
  github: string | null;

  @IsEnum(Team)
  @IsOptional()
  team: Team | null;

  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  role: Role[] | null;
}
