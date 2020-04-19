import * as TelegramBot from 'node-telegram-bot-api';

export type CallBackQueryHandlerWithCommandArgument<T = TelegramBot.Message> = (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    commandParameter?: string
) => Promise<T>;

export const TELEGRAM_PREFIX: string = 'telegram';
export const UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER: number = 3;
