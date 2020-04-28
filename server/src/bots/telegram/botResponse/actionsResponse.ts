import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getCloseActionMessage } from '../../../messages/feature/actionsMessages';

export const closeActionResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        getCloseActionMessage(user.settings?.locale)
    );
};
