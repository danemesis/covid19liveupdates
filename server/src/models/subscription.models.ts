import { CountrySituationInfo } from './covid19.models';
import { Chat } from './bots';

export enum SubscriptionType {
    TrackCountryUpdates = 'New country',
    Country = 'Country',
    Continent = 'Continent',
    World = 'World',
}

export interface Subscription {
    active: boolean;
    type: SubscriptionType;
    value: string;
    lastReceivedData: CountrySituationInfo;
    lastUpdate: number; // Date.now()
}

export interface UserSubscription {
    chat: Chat;
    subscriptionsOn: Array<Subscription>;
}

export interface UserSubscriptionNotification {
    subscription: Subscription;
    subscriptionMessage: string;
}
