import { userFactory } from '../testing/factories/user.factory';
import { toGetUserResponseDto } from './users.utils';

describe('toGetUserResponseDto()', () => {
  it('returns the correct DTO', () => {
    const user = userFactory();

    expect(toGetUserResponseDto(user)).toEqual({
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
    });
  });
});
