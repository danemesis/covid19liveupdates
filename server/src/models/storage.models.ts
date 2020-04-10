import {UserSubscription} from "./subscription.models";

export interface SubscriptionStorage {
    [chatId: string]: UserSubscription;
}
