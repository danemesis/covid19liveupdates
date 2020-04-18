import { getFullMenuKeyboard } from '../services/keyboard';
import { greetUser } from '../../../messages/userMessage';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { helpInfoResponse } from './helpResponse';

export const startResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    await bot.sendMessage(
        chatId,
        `${greetUser(message.from)}`,
        getFullMenuKeyboard(message)
    );
    return helpInfoResponse(bot, message, chatId);
};
