import { UserSubscription } from './subscription.models';
import { User } from './user.model';

export interface SubscriptionStorage {
    [chatId: number]: UserSubscription;
}

export interface UserStorage {
    [chatId: number]: User;
}
