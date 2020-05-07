import { getHelpMessage } from '../../../messages/feature/helpMessages';
import {
    TelegramCallBackQueryHandlerWithCommandArgument,
    TelegramCallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getFullClickableFeaturesInlineKeyBoard } from '../services/keyboard';

export const helpInfoResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        getHelpMessage(user.settings?.locale),
        getFullClickableFeaturesInlineKeyBoard(user.settings?.locale)
    );
};
