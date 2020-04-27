import { getHelpMessage } from '../../../messages/feature/helpMessages';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getFullMenuKeyboard } from '../services/keyboard';

export const helpInfoResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        getHelpMessage(),
        getFullMenuKeyboard(chatId, user.settings?.locale)
    );
};
