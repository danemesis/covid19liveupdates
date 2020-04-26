import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getCloseActionMessage } from '../../../messages/feature/actionsMessages';
import { runInterruptedCommandResponse } from './runInterruptedCommandReponse';

export const closeActionResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    message,
    messageHandlerRegistry,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const closeActionMessageResponse = await bot.sendMessage(
        chatId,
        getCloseActionMessage(user.settings?.locale)
    );

    if (user.state.interruptedCommand) {
        return runInterruptedCommandResponse({
            message,
            messageHandlerRegistry,
            user,
        });
    }

    return closeActionMessageResponse;
};
