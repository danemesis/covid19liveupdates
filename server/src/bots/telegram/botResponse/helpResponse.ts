import { getHelpMessage } from '../../../messages/feature/helpMessages';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const helpInfoResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(chatId, getHelpMessage());
};
