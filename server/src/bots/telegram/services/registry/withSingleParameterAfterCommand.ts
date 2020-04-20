import { CallBackQueryHandlerWithCommandArgument } from '../../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { logger } from '../../../../utils/logger';
import { LogglyTypes } from '../../../../models/loggly.models';
import { noResponse } from '../../botResponse/noResponse';
import { MessageHandlerRegistry } from './messageHandlerRegistry';
import { getParameterAfterCommandFromMessage } from './getParameterAfterCommandFromMessage';

/**
 * This function is wrapper around the original User's query handler
 * It adds an additional parameter (if such exist) to original handler,
 * which will be an parameter following after command
 */
export const withSingleParameterAfterCommand = (
    context: MessageHandlerRegistry,
    handlerFn: CallBackQueryHandlerWithCommandArgument
): CallBackQueryHandlerWithCommandArgument => {
    return (
        bot: TelegramBot,
        message: TelegramBot.Message,
        chatId: number,
        ikCbData?: string
    ): Promise<TelegramBot.Message> => {
        try {
            const userEnteredArgumentAfterCommand: string = getParameterAfterCommandFromMessage(
                context.singleParameterAfterCommands,
                (ikCbData ?? message.text).toLocaleLowerCase()
            );

            return handlerFn.call(
                context,
                bot,
                message,
                chatId,
                userEnteredArgumentAfterCommand
            );
        } catch (err) {
            logger.log('error', {
                ...message,
                type: LogglyTypes.CommandError,
                message: err.message,
            });

            return noResponse(bot, message, chatId);
        }
    };
};
