import * as TelegramBot from 'node-telegram-bot-api';

export type CallBackQueryHandlerWithCommandArgument = (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    parameterAfterCommand?: string
) => unknown;

export const TELEGRAM_PREFIX: string = 'telegram';
export const UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER: number = 3;
