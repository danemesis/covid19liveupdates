import {UserSubscription} from "./subscription.models";

export interface SubscriptionStorage {
    [chatId: number]: UserSubscription;
}
