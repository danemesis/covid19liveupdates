import {TelagramChat} from "../bots/telegram/models";

export interface UserSubscription {
    chat: TelagramChat;
    subscriptionsOn: Array<string>;
}