import { getHelpMessage } from '../../../messages/feature/helpMessages';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getFullClickableFeaturesInlineKeyBoard } from '../services/keyboard';

export const helpInfoResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        getHelpMessage(user.settings?.locale),
        getFullClickableFeaturesInlineKeyBoard(user.settings?.locale)
    );
};
