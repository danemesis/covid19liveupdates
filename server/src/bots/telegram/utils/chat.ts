import * as TelegramBot from 'node-telegram-bot-api';

export const getChatId = (message: TelegramBot.Message): number => {
    return message.chat.id;
};
