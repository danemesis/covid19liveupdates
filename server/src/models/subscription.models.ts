import {TelegramChat} from "../bots/telegram/models";
import {CountrySituationInfo} from "./covid19.models";

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
    chat: TelegramChat;
    subscriptionsOn: Array<Subscription>;
}

export interface UserSubscriptionNotification {
    subscription: Subscription;
    subscriptionMessage: string;
}
