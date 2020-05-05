import { ViberBot, ViberTextMessage } from '../bots/viber/models';
import * as TelegramBot from 'node-telegram-bot-api';
import { User } from './user.model';

export type Bot = ViberBot | TelegramBot;
export type Message = ViberTextMessage | TelegramBot.Message;

export interface CallBackQueryParameters<B extends Bot, M extends Message> {
    bot: B;
    message: M;
    chatId: number | string;
    user: User;
    commandParameter?: string;
}

export interface CallBackQueryParametersWithTwoArguments<
    B extends Bot,
    M extends Message
> extends CallBackQueryParameters<B, M> {
    secondCommandParameter?: string;
}

export type CallBackQueryHandlerWithCommandArgument<
    T = Message,
    P = CallBackQueryParametersWithTwoArguments<Bot, Message>
> = (parameters: P) => Promise<T>;
