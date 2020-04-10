import {TelegramChat} from "../bots/telegram/models";

export enum SubscriptionType {
    Country = 'Country',
    Continent = 'Continent',
    World = 'World',
}

export interface Subscription {
    type: SubscriptionType;
    value: string;
    lastUpdate: Date;
}

export interface UserSubscription {
    chat: TelegramChat;
    subscriptionsOn: Array<Subscription>;
}