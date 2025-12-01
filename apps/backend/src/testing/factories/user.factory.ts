import merge from 'lodash/merge';

import { UserStatus } from '@shared/types/user.types';
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
  reviews: [],
};

export const userFactory = (user: Partial<User> = {}): User =>
  merge({}, defaultUser, user);
