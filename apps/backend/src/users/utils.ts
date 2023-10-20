import { Status } from './types';
import { User } from './user.entity';

export const getCurrentUser = (): User => ({
  userId: 999,
  status: Status.MEMBER,
  firstName: 'jimmy',
  lastName: 'jimmy2',
  email: 'jimmy.jimmy2@mail.com',
  profilePicture: null,
  linkedin: null,
  github: null,
  team: null,
  role: null,
});
