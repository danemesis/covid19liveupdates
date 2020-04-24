import { User } from '../models/user.model';

export const getUserName = (user: User): string => {
    return user.firstName ?? user.lastName ?? user.userName ?? 'friend';
};
