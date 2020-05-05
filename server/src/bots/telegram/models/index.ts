import * as TelegramBot from 'node-telegram-bot-api';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
    CallBackQueryParametersWithTwoArguments,
} from '../../../models/bots';

export interface TelegramCallBackQueryParameters
    extends CallBackQueryParameters<TelegramBot, TelegramBot.Message> {
    chatId: number;
}

export interface TelegramCallBackQueryParametersWithTwoArguments
    extends CallBackQueryParametersWithTwoArguments<
        TelegramBot,
        TelegramBot.Message
    > {
    secondCommandParameter?: string;
}

export type TelegramCallBackQueryHandlerWithCommandArgument = CallBackQueryHandlerWithCommandArgument<
    TelegramBot.Message,
    TelegramCallBackQueryParametersWithTwoArguments
>;

export const TELEGRAM_PREFIX: string = 'telegram';
export const COUNTRIES_ROW_ITEMS_NUMBER: number = 4;
export const UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER: number = 3;
