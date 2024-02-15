import merge from 'lodash/merge';

import { UserStatus } from '../../users/types';
import { User } from '../../users/user.entity';

export const defaultUser: User = {
  id: 1,
  status: UserStatus.MEMBER,
  firstName: 'First',
  lastName: 'Last',
  email: 'email@email.com',
  profilePicture: null,
  linkedin: null,
  github: null,
  team: null,
  role: null,
  applications: [],
};

export const userFactory = (user: Partial<User> = {}): User =>
  merge({}, defaultUser, user);
