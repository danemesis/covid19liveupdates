import { CallBackQueryHandlerWithCommandArgument } from '../../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { logger } from '../../../../utils/logger';
import { noResponse } from '../../botResponse/noResponse';
import { MessageHandlerRegistry } from './messageHandlerRegistry';
import { getParameterAfterCommandFromMessage } from './getParameterAfterCommandFromMessage';
import { LogCategory } from '../../../../models/constants';

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
            logger.error(
                `Error happend inside withSingleParameterAfterCommand() for ${chatId} with message: ${message.text} and ikCbData: ${ikCbData}`,
                err,
                LogCategory.Command,
                chatId
            );

            return noResponse(bot, message, chatId);
        }
    };
};
