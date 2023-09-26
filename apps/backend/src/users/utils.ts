import { Status } from './types';
import { User } from './user.entity';

export const getCurrentUser = () => {
  const user = new User();

  user.id = 1;
  user.firstName = 'Current';
  user.lastName = 'User';
  user.email = 'user.current@northeastern.edu';
  user.status = Status.MEMBER;

  return user;
};
