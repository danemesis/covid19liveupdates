import {TelegramChat} from "../bots/telegram/models";

export interface UserSubscription {
    chat: TelegramChat;
    subscriptionsOn: Array<string>;
}