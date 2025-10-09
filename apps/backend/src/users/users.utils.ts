import { GetUserResponseDto } from './dto/get-user.response.dto';
import { User } from './user.entity';

export const toGetUserResponseDto = (user: User): GetUserResponseDto => {
  return {
    id: user.id,
    status: user.status,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    linkedin: user.linkedin,
    github: user.github,
    team: user.team,
    role: user.role,
  };
};
