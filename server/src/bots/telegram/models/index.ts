import * as TelegramBot from 'node-telegram-bot-api';

export type CallBackQueryHandler = (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
) => unknown;

export type CallBackQueryHandlerWithCommandArgument = (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    commandArgument: string
) => unknown;

export const TELEGRAM_PREFIX: string = 'telegram';
export const UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER: number = 3;
