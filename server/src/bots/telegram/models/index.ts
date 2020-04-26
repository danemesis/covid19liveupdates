import * as TelegramBot from 'node-telegram-bot-api';
import { User } from '../../../models/user.model';
import { MessageHandlerRegistry } from '../services/registry/messageHandlerRegistry';

export interface CallBackQueryParameters {
    bot: TelegramBot;
    message: TelegramBot.Message;
    chatId: number;
    user: User;
    messageHandlerRegistry: MessageHandlerRegistry,
    commandParameter?: string;
}

export interface CallBackQueryParametersWithTwoArguments
    extends CallBackQueryParameters {
    secondCommandParameter?: string;
}

export type CallBackQueryHandlerWithCommandArgument<
    T = TelegramBot.Message,
    P = CallBackQueryParametersWithTwoArguments
> = (parameters: P) => Promise<T>;

export const TELEGRAM_PREFIX: string = 'telegram';
export const UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER: number = 3;
