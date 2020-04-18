import { getHelpMessage } from '../../../messages/feature/helpMessages';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const helpInfoResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    return bot.sendMessage(chatId, getHelpMessage());
};
