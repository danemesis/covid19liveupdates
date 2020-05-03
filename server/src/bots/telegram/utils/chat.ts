import * as TelegramBot from 'node-telegram-bot-api';

export const getTelegramChatId = (message: TelegramBot.Message): number => {
    return message.chat.id;
};
