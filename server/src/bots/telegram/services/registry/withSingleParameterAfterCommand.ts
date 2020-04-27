import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { logger } from '../../../../utils/logger';
import { noResponse } from '../../botResponse/noResponse';
import { getParameterAfterCommandFromMessage } from './getParameterAfterCommandFromMessage';
import { LogCategory } from '../../../../models/constants';
import { MessageHandlerRegistry } from './messageHandlerRegistry';

/**
 * This function is wrapper around the original User's query handler
 * It adds an additional parameter (if such exist) to original handler,
 * which will be an parameter following after command
 * * @example /country Ukraine
 */
export const withSingleParameterAfterCommand = (
    context: MessageHandlerRegistry,
    handlerFn: CallBackQueryHandlerWithCommandArgument
): CallBackQueryHandlerWithCommandArgument => {
    return ({
        bot,
        message,
        chatId,
        user,
        commandParameter,
    }: CallBackQueryParameters): Promise<TelegramBot.Message> => {
        try {
            const userEnteredArgumentAfterCommand: string = getParameterAfterCommandFromMessage(
                context.singleParameterAfterCommands,
                (commandParameter ?? message.text).toLocaleLowerCase()
            );

            return handlerFn.call(context, {
                bot,
                message,
                chatId,
                user,
                commandParameter: userEnteredArgumentAfterCommand,
            });
        } catch (err) {
            logger.error(
                `Error happend inside withSingleParameterAfterCommand() for ${chatId} with message: ${message.text} and commandParameter: ${commandParameter}`,
                err,
                LogCategory.Command,
                chatId
            );

            return noResponse({ bot, message, chatId, user });
        }
    };
};
